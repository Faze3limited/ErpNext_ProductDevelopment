# Copyright (c) 2023, Indictrans and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import flt
from frappe.model.naming import make_autoname


class CostEstimate(Document):
	def autoname(self):
		name = self.buyer+'-'+str(self.final_ref_no)+'-'+str(round(self.gsm))
		self.name = make_autoname(name+'-.####')


	def validate(self):
		total_gsm = 0.0
		width_in_cms = 0.0
		length_in_cms = 0.0
		finished_sqmt = 0.0
		for row in self.gsm_breakup_table:
			total_gsm+=row.gsm
		self.total_gsm = total_gsm
		self.gsm = total_gsm
		for row in self.yarn_dimensions_and_weight:
			width_in_cms+=row.width_in_cms
			length_in_cms+=row.length_in_cms

		if self.is_new():
			sum_cost=["Material Cost Breakup", "Stitching", "Packaging", "Processing"]
			cost_sum = {}
			cost_sum["Material Cost Breakup"]=self.total_material_amount
			cost_sum["Stitching"]=self.total_stiching_amount
			cost_sum["Packaging"]=self.total_packaging_amount
			cost_sum["Processing"]=self.total_processing_amount

			running_total = 0.0
			for row in sum_cost:
				running_total+=flt(cost_sum.get(row))
				self.append("cost_summary_table",{
					"cost_summary_label": row,
					"amount":flt(cost_sum.get(row)),
					"running_total":running_total
				})

			self.total_raw_materials_cut_sew_packaging_costs=running_total

			other_label=["Rejection", "Transport", "Testing/Sample Devlopment & Others"]

			other_runing = 0.0
			for row in other_label:
				other_runing = self.total_raw_materials_cut_sew_packaging_costs
				if row=="Testing/Sample Devlopment & Others":
					other_runing+=flt(self.net_amount)

				if row=="Transport":
					other_runing+=flt(self.net_amount)
					self.append("others_summary_table", {
						"summary_label":row,
						"amount":flt(self.net_amount),
						"running_totals":other_runing
					})
				else:
					self.append("others_summary_table", {
						"summary_label":row,
						"running_totals":other_runing
					})

			self.total_variable_running_amunt=other_runing
			self.total_variable_amount=other_runing

			profit_label=["Overheads", "Interest", "Profit", "DA + Commission"]
			for row in profit_label:
				self.append("profit_and_interest_table", {
					"summary_label":row,
					"input_value": frappe.db.get_value("Profit and Interest", row, "interest_percent"),
					"running_totals":other_runing
				})

			self.total_amount=other_runing
			if flt(self.total_amount)>0:
				self.total_calculation()	

	def after_insert(self):
		if flt(self.total_amount)>0:
			self.total_calculation()
		self.price_inr=round(flt(self.total_amount), 2)
		self.price_usd=round(flt(self.total_amount_in_usd), 2)
		self.per_sqmt=round(self.weight, 2)/round(self.finished_sqmt, 2)
		self.weight_=round(self.weight, 2)
		self.gsm = self.total_gsm
		self.variable_cost = round(flt(self.total_variable_amount), 2)
		overheads = 0.0
		contribution = 0.0
		for row in self.profit_and_interest_table:
			contribution+=flt(row.amount)
			if row.summary_label=="Overheads":
				overheads+=flt(row.amount)
		self.overheads=round(overheads, 2)
		self.contribution=round(contribution, 2)
		self.price_usd_sqmt = self.price_usd/round(self.finished_sqmt, 2)
		self.price_inr_sqmt = self.price_inr/round(self.finished_sqmt, 2)
		self.variable_cost_sqmt = self.variable_cost/round(self.finished_sqmt, 2)
		self.overheads_sqmt = self.overheads/round(self.finished_sqmt, 2)
		self.contribution_sqmt = self.contribution/round(self.finished_sqmt, 2)
		if self.contribution>0:
			self.contribution_ = (self.contribution/round(flt(self.total_amount), 2))*100
		self.realisation_kg = round(flt(self.total_amount), 2)/self.weight

	def total_calculation(self):
		total_material_amount = 0.0
		total_stiching_amount = 0.0
		total_packaging_amount = 0.0
		total_processing_amount = 0.0
		for row in self.material_cost_breakup:
			total_material_amount+=flt(row.amount)
		self.total_material_amount=(total_material_amount*(100+3))/100

		for row in self.fixed_stiching_cost_table:
			total_stiching_amount+=flt(row.amount)
		self.total_stiching_amount=total_stiching_amount

		for row in self.packaging:
			total_packaging_amount+=flt(row.final_amount)
		self.total_packaging_amount=total_packaging_amount

		for row in self.processing_items_table:
			total_processing_amount+=flt(row.amount)
		self.total_processing_amount=total_processing_amount

		self.material_percent=(flt(self.total_material_amount)/flt(self.total_amount))*100
		self.stiching_percent=(flt(self.total_stiching_amount)/flt(self.total_amount))*100
		self.packaging_percent=(flt(self.total_packaging_amount)/flt(self.total_amount))*100
		self.processing_percent=(flt(self.total_processing_amount)/flt(self.total_amount))*100
		self.transport_percent=(flt(self.net_amount)/flt(self.total_amount))*100


	@frappe.whitelist()
	def set_data_on_upf(self, args=None):
		if self.unique_produt_form:
			_doc = frappe.get_doc("Unique Product Form", self.unique_produt_form)
			grosstuft_width = 0.0
			grosstuft_length = 0.0
			qty = 0.0
			rate = 0.0
			stich_quantity = 0.0
			quantity = 0.0
			for row in _doc.size_breakup_table:
				grosstuft_width = flt(row.width_in_cms)+flt(self.tuft_margin_width)-flt(row.width)
				grosstuft_length = flt(row.length_in_cms)+flt(self.tuft_margin_length)-flt(row.length)

			qty = (grosstuft_width*grosstuft_length)/10000
			if not self.material_cost_breakup:
				for row in _doc.gsm_breakup_table:
					itemrate = frappe.db.get_value("Item Price", {"item_code":row.item_code}, "price_list_rate")
					if itemrate:
						rate = itemrate
					else:
						rate = 0.0

					self.append("material_cost_breakup",{
						"item_code":row.item_code,
						"uom": frappe.db.get_value("Item", row.item_code, "stock_uom"),
						"qty": qty,
						"rate": rate,
						"amount": qty*rate
					})

			if self.stiching_type=="Overlocking" or self.stiching_type=="Over Edgeing":
				stich_quantity=(grosstuft_width+grosstuft_length)*2*self.per_running_meter
			else:
				stich_quantity=(grosstuft_width+grosstuft_length)*2/100

			self.stich_quantity = stich_quantity
			self.stich_amount = self.stich_rate*stich_quantity

			stich_type = ["Backing Thread", "Labour Charges"] 

			quantity = (grosstuft_width+grosstuft_length)*2/100
			if not self.fixed_stiching_cost_table:
				for row in stich_type:
					self.append("fixed_stiching_cost_table",{
						"description":row,
						"quantity":  quantity if row=="Labour Charges" else 0
					})


			if not self.packaging:
				for row in _doc.packing_components_table:
					self.append("packaging",{
						"packing_components":row.packing_components,
						"qty": row.quantity,
						"rate": row.rate,
						"amount": (row.quantity*row.rate)+((row.quantity*row.rate) *(self.joint_wastage/100))
					})

			self.quantity = self.weight*103

			return True



	# @frappe.whitelist()
	# def set_value_on_uniqueproductform(self, args=None):
	# 	if args:
	# 		_doc = frappe.get_doc("Unique Product Form", {"name": args[0]})
	# 		self.yarn_quality = _doc.yarn_quality
	# 		self.resultant_yarn = _doc.resultant_yarn
	# 		self.total_gsm = _doc.total_gsm
	# 		finished_sqmt=0.0
	# 		grosstuft_width = 0.0
	# 		grosstuft_length = 0.0
	# 		for row in _doc.size_breakup_table:
	# 			grosstuft_width = flt(row.width_in_cms)+flt(self.tuft_margin_width)-flt(row.width)
	# 			grosstuft_length = flt(row.length_in_cms)+flt(self.tuft_margin_length)-flt(row.length)
	# 			if row.size_in=="Inch":
	# 				self.append("yarn_dimensions_and_weight",{
	# 					"uom":row.size_in,
	# 					"width_in_inches":row.width,
	# 					"length_in_inches":row.length,
	# 					"width_in_cms":row.width_in_cms,
	# 					"length_in_cms":row.length_in_cms,
	# 					"grosstuft_width":flt(row.width_in_cms)+flt(self.tuft_margin_width)-flt(row.width),
	# 					"grosstuft_length":flt(row.length_in_cms)+flt(self.tuft_margin_length)-flt(row.length)
	# 				})

	# 				finished_sqmt = flt(flt(row.width_in_cms)*flt(row.length_in_cms))/10000
	# 		self.finished_sqmt = finished_sqmt
	# 		self.weight = flt(finished_sqmt)*(flt(self.total_gsm)/10000)
	# 		for row in _doc.gsm_breakup_table:
	# 			self.append("gsm_breakup_table",{
	# 				"item_code":row.item_code,
	# 				"gsm":row.gsm
	# 			})

	# 			self.append("material_cost_breakup",{
	# 				"item_code":row.item_code,
	# 				"qty": (grosstuft_width*grosstuft_length)/10000
	# 			})

	# 		return True