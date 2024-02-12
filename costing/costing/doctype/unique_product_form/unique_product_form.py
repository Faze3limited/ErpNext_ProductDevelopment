# Copyright (c) 2023, Indictrans and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import flt
from frappe import _
import math
from frappe.model.naming import make_autoname

class UniqueProductForm(Document):
	def autoname(self):
		name = self.buyer+'-'+str(self.final_ref_no)+'-'+self.construction
		self.name = make_autoname(name+'-.####')

	def validate(self):
		total = 0.0
		for row in self.yarn:
			total+=row.percent
		if total>100:
			frappe.throw("Yarn percent should be 100%")

	@frappe.whitelist()
	def set_value_on_uniqueproductform(self, args=None):
		if args:
			_doc = frappe.get_doc("Unique Product Form", {"name": args[0]})
			self.buyer = _doc.buyer
			self.factory = _doc.factory
			self.item_category = _doc.item_category
			self.yarn_type = _doc.yarn_type
			self.additional_yarn_info = _doc.additional_yarn_info
			self.specification_if_any = _doc.additional_yarn_info
			self.recycled = _doc.recycled
			self.construction = _doc.construction
			self.additional_construction_info = _doc.additional_construction_info
			self.design_type = _doc.design_type
			self.sampling_ref_no = _doc.sampling_ref_no
			self.final_ref_no = _doc.final_ref_no
			self.yarn_quality = _doc.yarn_quality
			self.resultant_yarn = _doc.resultant_yarn
			self.stitch_type = _doc.stitch_type
			self.total_gsm = _doc.total_gsm
			self.fold = _doc.fold
			self.packing_components_template = _doc.packing_components_template
			self.processing = _doc.processing
			for row in _doc.size_breakup_table:
				self.append("size_breakup_table",{
					"size_in":row.size_in,
					"width":row.width,
					"length":row.length,
					"width_in_cms":row.width_in_cms,
					"length_in_cms":row.length_in_cms
				})

			for row in _doc.gsm_breakup_table:
				self.append("gsm_breakup_table",{
					"item_code":row.item_code,
					"gsm":row.gsm
				})

			for row in _doc.packing_components_table:
				self.append("packing_components_table",{
					"packing_components":row.packing_components,
					"description":row.description,
					"quantity":row.quantity,
					"rate":row.rate,
					"amount":row.amount
				})

			return True


	@frappe.whitelist()
	def get_packing_components_template(self, args=None):
		if self.packing_components_template:
			total_amount = 0.0
			_doc = frappe.get_doc("Packing Components", self.packing_components_template)
			for row in _doc.packing_components_table:
				total_amount += flt(row.rate)/flt(row.quantity)
				self.append("packing_components_table",{
					"packing_components":row.packing_components,
					"description":row.description,
					"quantity":row.quantity,
					"rate":row.rate,
					"amount":flt(row.rate)/flt(row.quantity)
				})
			self.total_amount=total_amount
			return True

	@frappe.whitelist()
	def get_cost_sheet_for_size(self, args=None):
		data = []
		size_name = ""
		cost_sheet_no = []
		cost_sheet_data = []
		
		# if not self.for_all_size and flt(self.size_no)==0:
		# 	frappe.throw("Please enable for_all_size or add size_no")
		# elif self.for_all_size and flt(self.size_no)>0:
		# 	frappe.throw("Please select for_all_size or size_no, not both")

		for row in self.size_breakup_table:
			if row.size_in=="Inch":
				size_name=str(row.width)+" “x "+str(row.length)+"”"
			else:
				size_name=str(row.width)+" x "+str(row.length)

			for rw in self.gsm_breakup_table:
				cost_sheet_data.append({"size_name":size_name, "item_code":rw.item_code, "gsm":rw.gsm, "size_no":self.size_no})
				# if not self.for_all_size and row.idx==flt(self.size_no):
				# 	cost_sheet_data.append({"size_name":size_name, "item_code":rw.item_code, "gsm":rw.gsm, "size_no":self.size_no})
				# elif self.for_all_size:
				# 	cost_sheet_data.append({"size_name":size_name, "item_code":rw.item_code, "gsm":rw.gsm, "size_no":self.size_no})
			if cost_sheet_data:
				data.append(cost_sheet_data)
			cost_sheet_data = []


		final_cost_sheet = []
		const_no = 0
		const_no += len(self.cost_sheet_for_size)
		gsm=0.0
		cost_sheet_dict={"gsm":0.0}
		for rw in data:
			const_no+=1
			for row in rw:
				row["cost_sheet_no"] = const_no
				cost_sheet_dict["cost_sheet_no"] = const_no
				cost_sheet_dict["size"] = row.get("size_name")
				cost_sheet_dict["gsm"] = flt(cost_sheet_dict.get("gsm"))+flt(row.get("gsm"))
			final_cost_sheet.append(cost_sheet_dict)
			cost_sheet_dict={"gsm":0.0}
			gsm=0.0

		for row in final_cost_sheet:
			self.append("cost_sheet_for_size",{
				"size":row.get("size"),
				"gsm":row.get("gsm"),
				"cost_sheet_no":row.get("cost_sheet_no")
			})
			self.append("carton_table",{
				"size":row.get("size"),
				"cost_sheet_no":row.get("cost_sheet_no")
			})

		for rw in data:
			for row in rw:
				self.append("gsm_breakup_summary",{
					"size":row.get("size_name"),
					"gsm":row.get("gsm"),
					"cost_sheet_no":row.get("cost_sheet_no"),
					"item_code":row.get("item_code")
				})

		return data


	@frappe.whitelist()
	def create_cost_estimate(self, args=None):
		data = []
		size_ = {}
		cost_estimate = []
		over_rate = 0.0
		grosstuft_length = 0.0
		grosstuft_width = 0.0
		no_in_width = 0.0
		no_of_mats = 0.0
		pile_face = 0.0
		gsm = 0.0
		total_gsm = 0.0
		quantity = 0.0
		finished_sqmt = 0.0
		total_packaging_amount = 0.0
		total_material_amount = 0.0
		for row in self.cost_sheet_for_size:
			data.append(row.cost_sheet_no)
			size_[row.cost_sheet_no] = row.size


		for sheet_no in data:
			cost_doc = frappe.new_doc("Cost Estimate")
			cost_doc.unique_produt_form = self.name,
			cost_doc.fold_mat = self.fold
			for row in self.size_breakup_table:
				if row.size_in=="Inch":
					size_name=str(row.width)+" “x "+str(row.length)+"”"
					# grosstuft_length=2.5+row.length_in_cms
					# grosstuft_width=2.5+row.width_in_cms
				else:
					size_name=str(row.width)+ ' x ' +str(row.length)
					# grosstuft_length=2.5+row.length
					# grosstuft_width=2.5+row.width
				
				if size_.get(sheet_no)==size_name:
					if row.size_in=="Inch":
						grosstuft_length=2.5+row.length_in_cms
						grosstuft_width=2.5+row.width_in_cms
					else:
						grosstuft_length=2.5+row.length
						grosstuft_width=2.5+row.width

					no_in_width = 216/grosstuft_width
					no_of_mats=((100*100)/grosstuft_length)*math.floor(no_in_width)
					cost_doc.no_in_width = math.floor(no_in_width)
					cost_doc.pile_face = grosstuft_width*math.floor(no_in_width)
					cost_doc.size = size_name

					finished_sqmt=flt(flt(row.width_in_cms)*flt(row.length_in_cms))/10000
					cost_doc.finished_sqmt = finished_sqmt
					cost_doc.append("yarn_dimensions_and_weight",{
						"uom": row.size_in,
						"width_in_inches":row.width,
						"length_in_inches":row.length,
						"width_in_cms": row.width_in_cms,
						"length_in_cms": row.length_in_cms,
						"grosstuft_width": grosstuft_width,
						"grosstuft_length": grosstuft_length,
						"no_of_mats_in_100_meters": no_of_mats
					})

			for row in self.gsm_breakup_summary:
				rate = 0.0
				if sheet_no==row.cost_sheet_no:
					total_gsm+=row.gsm	
					cost_doc.append("gsm_breakup_table",{
						"item_code": row.item_code,
						"gsm":row.gsm,
						"cost_sheet_no":row.cost_sheet_no
					})
					itemrate = frappe.db.get_value("Item Price", {"item_code":row.item_code, "selling":1}, "price_list_rate")
					if itemrate:
						rate = itemrate
					else:
						rate = 0.0

					if row.item_code=="Yarn: Pile":
						over_rate=rate

					gsm = row.gsm/1000

					if (row.item_code=="PP Fabric"):
						quantity=((216/math.floor(no_in_width))*grosstuft_length)/10000
					else:
						if frappe.db.get_value("Item", row.item_code, "stock_uom")=="Kg":
							quantity = ((grosstuft_width*grosstuft_length)/10000)*gsm
						else:
							quantity = grosstuft_width*grosstuft_length/10000
						
					wastage_ = frappe.db.get_value("Item", row.item_code, "wastage")
					amount = round((quantity*rate)*(100+flt(wastage_)))/100
					cost_doc.append("material_cost_breakup",{
						"item_code":row.item_code,
						"uom": frappe.db.get_value("Item", row.item_code, "stock_uom"),
						"wastage_":wastage_,
						"rate": rate,
						"qty":quantity,
						"amount":amount
					})
					total_material_amount+=amount
					cost_doc.weight = finished_sqmt*(total_gsm/1000)
					cost_doc.weight_ = finished_sqmt*(total_gsm/1000)
					cost_doc.per_sqmt = (finished_sqmt*(total_gsm/1000))/finished_sqmt
					cost_doc.gsm = total_gsm
			cost_doc.total_material_amount = (total_material_amount*(100+3))/100
			for row in self.yarn:	
				cost_doc.append("yarn",{
					"yarn_quality": row.yarn_quality,
					"resultant_yarn":row.resultant_yarn,
					"percent":row.percent,
					"process_type":row.process_type
				})

			per_running_meter=0.0
			stitch_qty = 0.0
			stitch_amount = 0.0
			total_stiching_amount = 0.0
			for row in self.stitch:
				per_running_meter = frappe.db.get_value("Stitch Type", row.stitch_type, "consumption_per_running_mtr")
				rate = frappe.db.get_value("Stitch Type", row.stitch_type, "rate")
				uom = frappe.db.get_value("Stitch Type", row.stitch_type, "uom")
				if uom=="Running Meters":  
					stitch_qty = (grosstuft_width+grosstuft_length)*2/100
				else:
					stitch_qty = (grosstuft_width+grosstuft_length)*2*flt(per_running_meter)

				if row.stitch_type=="Overlocking" or row.stitch_type=="Over Edgeing":
					stitch_amount =  stitch_qty*flt(over_rate)/1000
					total_stiching_amount+=stitch_amount
					cost_doc.append("fixed_stiching_cost_table",{
						"stitch_type": row.stitch_type,
						"rate": flt(over_rate)/1000,
						"per_running_meter": per_running_meter,
						"quantity":stitch_qty,
						"amount": stitch_amount
					})
				else:
					stitch_amount = stitch_qty*flt(rate)
					total_stiching_amount+=stitch_amount
					cost_doc.append("fixed_stiching_cost_table",{
						"stitch_type": row.stitch_type,
						"rate": rate,
						"per_running_meter": per_running_meter,
						"quantity":stitch_qty,
						"amount": stitch_qty*flt(rate)
					})
			cost_doc.total_stiching_amount=total_stiching_amount

			for row in self.packing_components_table:
				total_packaging_amount+=row.amount	
				cost_doc.append("packaging",{
					"packing_components": row.packing_components,
					"qty":row.quantity,
					"rate": row.rate,
					"amount": row.amount,
					"final_amount": row.amount
				})

			cost_doc.total_packaging_amount=total_packaging_amount

			proc_qty=0.0
			proc_amount=0.0
			total_processing_amount = 0.0
			for row in self.processing:
				proc_wastage = frappe.db.get_value("Processing", row.processing, "wastage")
				if "Square Meter"==frappe.db.get_value("Processing", row.processing, "uom"):
					proc_qty= (finished_sqmt*(100+flt(proc_wastage)))/100
				else:
					proc_qty= ((finished_sqmt*(total_gsm/1000))*(100+flt(proc_wastage)))/100
				proc_rate = frappe.db.get_value("Processing", row.processing, "rate")
				proc_amount = flt(proc_qty)*flt(proc_rate)	
				total_processing_amount+=proc_amount
				cost_doc.append("processing_items_table",{
					"processing_type": row.processing,
					"rate": proc_rate,
					"qty": proc_qty,
					"amount": proc_amount
				})
			cost_doc.total_processing_amount=total_processing_amount

			cubic_metres_cbm =0.0
			net_amount = 0.0
			for row in self.carton_table:
				if row.cost_sheet_no==sheet_no:
					costcbm = frappe.db.get_value("Container", row.container, "amount")
					cubic_metres_cbm = (row.width*row.length*row.height)/1000000
					net_amount = cubic_metres_cbm*flt(costcbm)/flt(row.no_of_pieces)
					cost_doc.width=row.width
					cost_doc.length=row.length
					cost_doc.height=row.height
					cost_doc.container=row.container
					cost_doc.no_of_piecescarton=row.no_of_pieces
					cost_doc.cubic_metres_cbm = cubic_metres_cbm
					cost_doc.costcbm = flt(costcbm)
					cost_doc.net_amount = flt(net_amount)
			cost_doc.buyer = self.buyer
			cost_doc.final_ref_no = self.final_ref_no 
			cost_doc.construction =  self.construction
			# cost_doc.total_stiching_amount
			cost_doc.save()
			frappe.db.commit()
			total_gsm=0.0
			cost_estimate.append(cost_doc.name)
		if cost_estimate:
			frappe.msgprint(
				_("Cost {0} Estimate Created.").format(
					cost_estimate
				),
				indicator="green",
			)

# @frappe.whitelist()
# def make_cost_estimate(source_name, target_doc=None):
# 	from frappe.model.mapper import get_mapped_doc

# 	doc = get_mapped_doc(
# 		"Unique Product Form",
# 		source_name,
# 		{
# 			"Unique Product Form": {
# 				"doctype": "Cost Estimate",
# 				"field_map": {
# 					"name": "unique_produt_form",
# 					"yarn_quality": "yarn_quality",
# 					"resultant_yarn": "resultant_yarn",
# 					"total_gsm": "total_gsm",
# 					"stitch_type": "stiching_type",
# 					"processing": "processing_type",
# 					"fold": "fold_mat"
# 				}
# 			},
# 			"Size Breakup Table": {
# 				"doctype": "Yarn Dimensions And Weight",
# 				"field_map": {
# 					"size_in":"uom",
# 					"width":"width_in_inches",
# 					"length":"length_in_inches",
# 					"width_in_cms":"width_in_cms",
# 					"length_in_cms":"length_in_cms"
# 				}
# 			},
# 			"GSM Breakup Table": {
# 				"doctype": "GSM Breakup Table",
# 				"field_map": {
# 					"item_code":"item_code",
# 					"gsm":"gsm"
# 				}
# 			},
# 		},
# 		target_doc,
# 	)
# 	return doc