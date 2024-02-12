# Copyright (c) 2023, Indictrans and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
import math
from frappe.utils import flt
from frappe.model.naming import make_autoname

class DapadaCostSheet(Document):
	def autoname(self):
		name = self.customer+'-'+self.design_no+'-'+self.product_name+'-'+self.nameversion
		self.name = make_autoname(name+'-.#####')

	def after_insert(self):
		for row in self.fabric_costing_summary:
			if row.idx==1:
				row.sheet_name=self.name
		self.save()
		frappe.db.commit()

	@frappe.whitelist()
	def get_data_for_fabric_consumption(self):
		total_pieces_gross = 0.0
		pcs_per_100_metres = 0.0
		piece_cost = 0.0
		for row in self.fabric_costing_summary:
			for p in self.peice_cut_sizes:
				if p.fabric==row.sheet_name:
					total_pieces_gross = row.get("width")/p.get("cut_width")
					if total_pieces_gross<1:
						total_pieces_gross = 1
					pcs_per_100_metres = (100*39.37)*(math.floor(total_pieces_gross)/p.get('cut_length'))
					piece_cost = (row.get('cost')*100)/math.floor(pcs_per_100_metres)
					self.append('fabric_consumption',{
						'product': p.get('product_name'),
						'fabric_used': row.sheet_name,
						'width': p.get('width'),
						'length': p.get('length'),
						'cut_width': p.get('cut_width'),
						'cut_length': p.get('cut_length'),
						'total_pieces_gross': total_pieces_gross,
						'pcs_per_100_metres': pcs_per_100_metres,
						'fabric_cost':	row.get('cost'),
						'piece_cost': piece_cost
					})

		for row in self.backing_other_fabric_cost:
			for p in self.peice_cut_sizes:
				if row.name1==p.fabric:
					total_pieces_gross = row.get("width")/p.get("cut_width")
					if math.floor(total_pieces_gross)!=0:
						pcs_per_100_metres = (100*39.37)*(math.floor(total_pieces_gross)/p.get('cut_length'))
					else:
						pcs_per_100_metres = 0

					if math.floor(pcs_per_100_metres)!=0:
						piece_cost = (row.get('total_cost')*100)/math.floor(pcs_per_100_metres)
					else:
						piece_cost = 0

					self.append('fabric_consumption',{
						'product': p.get('product_name'),
						'fabric_used': row.get('name1'),
						'width': p.get('width'),
						'length': p.get('length'),
						'cut_width': p.get('cut_width'),
						'cut_length': p.get('cut_length'),
						'total_pieces_gross': total_pieces_gross,
						'pcs_per_100_metres': pcs_per_100_metres,
						'fabric_cost':	row.get('total_cost'),
						'piece_cost': piece_cost
					})

		product_cost = {}
		peices = {}

		for p in self.peice_cut_sizes:
			if not peices.get(p.product_name):
				peices[p.product_name]=p.peices

		for p in self.fabric_consumption:
			if product_cost.get(p.product):
				product_cost[p.product]=product_cost[p.product]+p.piece_cost
			else:
				product_cost[p.product]=p.piece_cost

		total_cost = 0.0

		self.set("packaging1", [])
		self.set("packaging2", [])
		self.set("packaging3", [])
		self.set("packaging4", [])

		self.packaging1_amt = 0.0
		self.packaging2_amt = 0.0
		self.packaging3_amt = 0.0
		self.packaging4_amt = 0.0

		packages = ['packaging1', 'packaging2', 'packaging3', 'packaging4']
		count=0
		for k, v in product_cost.items():
			stitch_cost = frappe.db.get_value("Item", {"name":k}, "stitch_cost")
			made_up_cost = frappe.db.get_value("Item", {"name":k}, "made_up_cost")
			total_cost = (flt(stitch_cost)+flt(made_up_cost)+flt(v))*flt(peices.get(k))
			self.append('total_product_cost',{
				'product_name': k,
				'fabric_cost': v,
				'stitch_cost': frappe.db.get_value("Item", {"name":k}, "stitch_cost"),
				'made_up_cost': frappe.db.get_value("Item", {"name":k}, "made_up_cost"),
				'peices': peices.get(k),
				'total_cost': round(total_cost, 4)
			})
			self.append(packages[count],{
				'product_name': k
			})
			count+=1

			self.append('transport_details_table',{
				'product_name': k
			})

		"""===========final_summary========="""
		self.set("final_summary", [])
		self.set("currency_summary", [])
		self.set("control_summary", [])
		self.set("cost_in_inr", [])
		final_product_cost = []
		for row in self.total_product_cost:
			final_product_cost.append({'Product Name': row.product_name, 'Total Fabric Cost': round(row.fabric_cost, 4), 'Stitch Cost': round(row.stitch_cost, 4), 'Made Up Cost': round(row.made_up_cost, 4), 'No of Pieces': round(row.peices, 4),
				'Total Cost': round(row.total_cost, 4)
			})

		label_lst = ["Product Name", "Total Fabric Cost", "Stitch Cost", "Made Up Cost", "No of Pieces", "Total Cost", "Rejection %", "Total Including Rejection", "Packaging", "Testing & Other Charges", "Transport", "Total Variable Cost", "Sampling & Development Charges %","Sampling & Development Charges", "Overheads %", "Overheads", "Interest %", "Interest", "Profit %", "Profit", "DA+Store Return+Commission %", "DA+Store Return+Commission"]
		total_cost1 = total_cost2 = total_cost3 = total_cost4 = 0.0
		total_variable_cost1 = total_variable_cost2 = total_variable_cost3 = total_variable_cost4 = 0.0
		_cost1 = _cost2 = _cost3 = _cost4 = 0.0
		interest1 = interest2 = interest3 = interest4 = 0.0
		sampling1 = sampling2 = sampling3 = sampling4 = 0.0
		contribution1 = contribution2 = contribution3 = contribution4 = 0.0
		overheads1 = overheads2 = overheads3 = overheads4 = 0.0
		profit1 = profit2 = profit3 = profit4 = 0.0

		faze_doc = frappe.get_doc("Fazethree Setting", "Fazethree Setting")

		for row in label_lst:
			if len(final_product_cost)==1:
				if row=="Rejection %":
					self.append("final_summary",{
						"label": row,
						"value1": faze_doc.rejection
					})
				elif row=="Total Including Rejection":
					_cost1 = total_cost1+(total_cost1*faze_doc.rejection/100)
					total_variable_cost1+=round(_cost1, 4)
					self.append("final_summary",{
						"label": row,
						"value1": round(_cost1, 4)
					})
				elif row=="Packaging":
					total_variable_cost1+=round(flt(self.packaging1_amt), 4)
					self.append("final_summary",{
						"label": row,
						"value1": round(self.packaging1_amt, 4)
					})
				elif row=="Total Variable Cost":
					self.append("final_summary",{
						"label": row,
						"value1": round(total_variable_cost1, 4)
					})
				elif row=="Sampling & Development Charges %":
					self.append("final_summary",{
						"label": row,
						"value1": faze_doc.sampling
					})
				elif row=="Overheads %":
					self.append("final_summary",{
						"label": row,
						"value1": faze_doc.overheads
					})
				elif row=="Interest %":
					self.append("final_summary",{
						"label": row,
						"value1": faze_doc.interest
					})
				elif row=="Profit %":
					self.append("final_summary",{
						"label": row,
						"value1": faze_doc.profit
					})
				elif row=="DA+Store Return+Commission %":
					self.append("final_summary",{
						"label": row,
						"value1": faze_doc.da_store_return_commission
					})
				elif row=="Sampling & Development Charges":
					_cost1 = total_variable_cost1*faze_doc.sampling/100
					total_variable_cost1+=round(_cost1, 4)
					sampling1=_cost1

					self.append("final_summary",{
						"label": row,
						"value1": round(_cost1, 4)
					})
				elif row=="Overheads":
					_cost1 = total_variable_cost1*faze_doc.overheads/100
					total_variable_cost1+=round(_cost1, 4)
					overheads1=_cost1
					self.append("final_summary",{
						"label": row,
						"value1": round(_cost1, 4)
					})
				elif row=="Interest":
					_cost1 = total_variable_cost1*faze_doc.interest/100
					total_variable_cost1+=round(_cost1, 4)
					interest1=_cost1
					self.append("final_summary",{
						"label": row,
						"value1": round(_cost1, 4)
					})
				elif row=="Profit":
					_cost1 = total_variable_cost1*faze_doc.profit/100
					total_variable_cost1+=round(_cost1, 4)
					profit1=_cost1
					self.append("final_summary",{
						"label": row,
						"value1": round(_cost1, 4)
					})
				elif row=="DA+Store Return+Commission":
					_cost1 = total_variable_cost1*faze_doc.da_store_return_commission/100
					total_variable_cost1+=round(_cost1, 4)
					self.append("final_summary",{
						"label": row,
						"value1": round(_cost1, 4)
					})
				elif row=="Price per piece in INR":
					self.append("final_summary",{
						"label": row,
						"value1": round(total_variable_cost1, 4)
					})
				else:
					if row=="Total Cost":
						total_cost1+=final_product_cost[0].get(row)
					self.append("final_summary",{
						"label": row,
						"value1":final_product_cost[0].get(row)
					})
			elif len(final_product_cost)==2:
				if row=="Rejection %":
					self.append("final_summary",{
						"label": row,
						"value1": faze_doc.rejection,
						"value2": faze_doc.rejection
					})
				elif row=="Total Including Rejection":
					_cost1 = total_cost1+(total_cost1*faze_doc.rejection/100)
					_cost2 = total_cost2+(total_cost2*faze_doc.rejection/100)
					total_variable_cost1+=round(_cost1, 4)
					total_variable_cost2+=round(_cost2, 4)
					self.append("final_summary",{
						"label": row,
						"value1": round(_cost1, 4),
						"value2": round(_cost2, 4)
					})
				elif row=="Packaging":
					total_variable_cost1+=round(flt(self.packaging1_amt), 4)
					total_variable_cost2+=round(flt(self.packaging2_amt), 4)
					self.append("final_summary",{
						"label": row,
						"value1": round(self.packaging1_amt, 4),
						"value2": round(self.packaging2_amt, 4)
					})
				elif row=="Total Variable Cost":
					self.append("final_summary",{
						"label": row,
						"value1": round(total_variable_cost1, 4),
						"value2": round(total_variable_cost2, 4)
					})
				elif row=="Sampling & Development Charges %":
					self.append("final_summary",{
						"label": row,
						"value1": faze_doc.sampling,
						"value2": faze_doc.sampling
					})
				elif row=="Overheads %":
					self.append("final_summary",{
						"label": row,
						"value1": faze_doc.overheads,
						"value2": faze_doc.overheads
					})
				elif row=="Interest %":
					self.append("final_summary",{
						"label": row,
						"value1": faze_doc.interest,
						"value2": faze_doc.interest
					})
				elif row=="Profit %":
					self.append("final_summary",{
						"label": row,
						"value1": faze_doc.profit,
						"value2": faze_doc.profit
					})
				elif row=="DA+Store Return+Commission %":
					self.append("final_summary",{
						"label": row,
						"value1": faze_doc.da_store_return_commission,
						"value2": faze_doc.da_store_return_commission
					})
				elif row=="Sampling & Development Charges":
					_cost1 = total_variable_cost1*faze_doc.sampling/100
					_cost2 = total_variable_cost2*faze_doc.sampling/100
					total_variable_cost1+=round(_cost1, 4)
					total_variable_cost2+=round(_cost2, 4)
					sampling1=_cost1
					sampling2=_cost2
					self.append("final_summary",{
						"label": row,
						"value1": round(_cost1, 4),
						"value2": round(_cost2, 4)
					})
				elif row=="Overheads":
					_cost1 = total_variable_cost1*faze_doc.overheads/100
					_cost2 = total_variable_cost2*faze_doc.overheads/100
					total_variable_cost1+=round(_cost1, 4)
					total_variable_cost2+=round(_cost2, 4)
					overheads1=_cost1
					overheads2=_cost2
					self.append("final_summary",{
						"label": row,
						"value1": round(_cost1, 4),
						"value2": round(_cost2, 4)
					})
				elif row=="Interest":
					_cost1 = total_variable_cost1*faze_doc.interest/100
					_cost2 = total_variable_cost2*faze_doc.interest/100
					total_variable_cost1+=round(_cost1, 4)
					total_variable_cost2+=round(_cost2, 4)
					interest1=_cost1
					interest2=_cost2
					self.append("final_summary",{
						"label": row,
						"value1": round(_cost1, 4),
						"value2": round(_cost2, 4)
					})
				elif row=="Profit":
					_cost1 = total_variable_cost1*faze_doc.profit/100
					_cost2 = total_variable_cost2*faze_doc.profit/100
					total_variable_cost1+=round(_cost1, 4)
					total_variable_cost2+=round(_cost2, 4)
					profit1=_cost1
					profit2=_cost2
					self.append("final_summary",{
						"label": row,
						"value1": round(_cost1, 4),
						"value2": round(_cost2, 4)
					})
				elif row=="DA+Store Return+Commission":
					_cost1 = total_variable_cost1*faze_doc.da_store_return_commission/100
					_cost2 = total_variable_cost2*faze_doc.da_store_return_commission/100
					total_variable_cost1+=round(_cost1, 4)
					total_variable_cost2+=round(_cost2, 4)
					self.append("final_summary",{
						"label": row,
						"value1": round(_cost1, 4),
						"value2": round(_cost2, 4)
					})
				elif row=="Price per piece in INR":
					self.append("final_summary",{
						"label": row,
						"value1": round(total_variable_cost1, 4),
						"value2": round(total_variable_cost2, 4)
					})
				else:
					if row=="Total Cost":
						total_cost1+=final_product_cost[0].get(row)
						total_cost2+=final_product_cost[1].get(row)
					self.append("final_summary",{
						"label": row,
						"value1":final_product_cost[0].get(row),
						"value2":final_product_cost[1].get(row)
					})
				
			elif len(final_product_cost)==3:
				if row=="Rejection %":
					self.append("final_summary",{
						"label": row,
						"value1": faze_doc.rejection,
						"value2": faze_doc.rejection,
						"value3": faze_doc.rejection
					})
				elif row=="Total Including Rejection":
					_cost1 = total_cost1+(total_cost1*faze_doc.rejection/100)
					_cost2 = total_cost2+(total_cost2*faze_doc.rejection/100)
					_cost3 = total_cost3+(total_cost3*faze_doc.rejection/100)
					total_variable_cost1+=round(_cost1, 4)
					total_variable_cost2+=round(_cost2, 4)
					total_variable_cost3+=round(_cost3, 4)
					self.append("final_summary",{
						"label": row,
						"value1": round(_cost1, 4),
						"value2": round(_cost2, 4),
						"value3": round(_cost3, 4)
					})
				elif row=="Packaging":
					total_variable_cost1+=round(flt(self.packaging1_amt), 4)
					total_variable_cost2+=round(flt(self.packaging2_amt), 4)
					total_variable_cost3+=round(flt(self.packaging3_amt), 4)
					self.append("final_summary",{
						"label": row,
						"value1": round(self.packaging1_amt, 4),
						"value2": round(self.packaging2_amt, 4),
						"value3": round(self.packaging3_amt, 4)
					})
				elif row=="Total Variable Cost":
					self.append("final_summary",{
						"label": row,
						"value1": round(total_variable_cost1, 4),
						"value2": round(total_variable_cost2, 4),
						"value3": round(total_variable_cost3, 4)
					})
				elif row=="Sampling & Development Charges %":
					self.append("final_summary",{
						"label": row,
						"value1": faze_doc.sampling,
						"value2": faze_doc.sampling,
						"value3": faze_doc.sampling
					})
				elif row=="Overheads %":
					self.append("final_summary",{
						"label": row,
						"value1": faze_doc.overheads,
						"value2": faze_doc.overheads,
						"value3": faze_doc.overheads
					})
				elif row=="Interest %":
					self.append("final_summary",{
						"label": row,
						"value1": faze_doc.interest,
						"value2": faze_doc.interest,
						"value3": faze_doc.interest
					})
				elif row=="Profit %":
					self.append("final_summary",{
						"label": row,
						"value1": faze_doc.profit,
						"value2": faze_doc.profit,
						"value3": faze_doc.profit
					})
				elif row=="DA+Store Return+Commission %":
					self.append("final_summary",{
						"label": row,
						"value1": faze_doc.da_store_return_commission,
						"value2": faze_doc.da_store_return_commission,
						"value3": faze_doc.da_store_return_commission
					})
				elif row=="Sampling & Development Charges":
					_cost1 = total_variable_cost1*faze_doc.sampling/100
					_cost2 = total_variable_cost2*faze_doc.sampling/100
					_cost3 = total_variable_cost3*faze_doc.sampling/100
					sampling1=_cost1
					sampling2=_cost2
					sampling3=_cost3
					total_variable_cost1+=round(_cost1, 4)
					total_variable_cost2+=round(_cost2, 4)
					total_variable_cost3+=round(_cost3, 4)
					self.append("final_summary",{
						"label": row,
						"value1": round(_cost1, 4),
						"value2": round(_cost2, 4),
						"value3": round(_cost3, 4)
					})
				elif row=="Overheads":
					_cost1 = total_variable_cost1*faze_doc.overheads/100
					_cost2 = total_variable_cost2*faze_doc.overheads/100
					_cost3 = total_variable_cost3*faze_doc.overheads/100
					overheads1=_cost1
					overheads2=_cost2
					overheads3=_cost3
					total_variable_cost1+=round(_cost1, 4)
					total_variable_cost2+=round(_cost2, 4)
					total_variable_cost3+=round(_cost3, 4)
					self.append("final_summary",{
						"label": row,
						"value1": round(_cost1, 4),
						"value2": round(_cost2, 4),
						"value3": round(_cost3, 4)
					})
				elif row=="Interest":
					_cost1 = total_variable_cost1*faze_doc.interest/100
					_cost2 = total_variable_cost2*faze_doc.interest/100
					_cost3 = total_variable_cost3*faze_doc.interest/100
					interest1=_cost1
					interest2=_cost2
					interest3=_cost3
					total_variable_cost1+=round(_cost1, 4)
					total_variable_cost2+=round(_cost2, 4)
					total_variable_cost3+=round(_cost3, 4)
					self.append("final_summary",{
						"label": row,
						"value1": round(_cost1, 4),
						"value2": round(_cost2, 4),
						"value3": round(_cost3, 4)
					})
				elif row=="Profit":
					_cost1 = total_variable_cost1*faze_doc.profit/100
					_cost2 = total_variable_cost2*faze_doc.profit/100
					_cost3 = total_variable_cost3*faze_doc.profit/100
					profit1=_cost1
					profit2=_cost2
					profit3=_cost3
					total_variable_cost1+=round(_cost1, 4)
					total_variable_cost2+=round(_cost2, 4)
					total_variable_cost3+=round(_cost3, 4)
					self.append("final_summary",{
						"label": row,
						"value1": round(_cost1, 4),
						"value2": round(_cost2, 4),
						"value3": round(_cost3, 4)
					})
				elif row=="DA+Store Return+Commission":
					_cost1 = total_variable_cost1*faze_doc.da_store_return_commission/100
					_cost2 = total_variable_cost2*faze_doc.da_store_return_commission/100
					_cost3 = total_variable_cost3*faze_doc.da_store_return_commission/100
					total_variable_cost1+=round(_cost1, 4)
					total_variable_cost2+=round(_cost2, 4)
					total_variable_cost3+=round(_cost3, 4)
					self.append("final_summary",{
						"label": row,
						"value1": round(_cost1, 4),
						"value2": round(_cost2, 4),
						"value3": round(_cost3, 4)
					})
				elif row=="Price per piece in INR":
					self.append("final_summary",{
						"label": row,
						"value1": round(total_variable_cost1, 4),
						"value2": round(total_variable_cost2, 4),
						"value3": round(total_variable_cost3, 4)
					})
				else:
					if row=="Total Cost":
						total_cost1+=final_product_cost[0].get(row)
						total_cost2+=final_product_cost[1].get(row)
						total_cost3+=final_product_cost[2].get(row)
					self.append("final_summary",{
						"label": row,
						"value1":final_product_cost[0].get(row),
						"value2":final_product_cost[1].get(row),
						"value3":final_product_cost[2].get(row)
					})
			else:
				if row=="Rejection %":
					self.append("final_summary",{
						"label": row,
						"value1": faze_doc.rejection,
						"value2": faze_doc.rejection,
						"value3": faze_doc.rejection,
						"value4": faze_doc.rejection
					})
				elif row=="Total Including Rejection":
					_cost1 = total_cost1+(total_cost1*faze_doc.rejection/100)
					_cost2 = total_cost2+(total_cost2*faze_doc.rejection/100)
					_cost3 = total_cost3+(total_cost3*faze_doc.rejection/100)
					_cost4 = total_cost4+(total_cost4*faze_doc.rejection/100)
					total_variable_cost1+=round(_cost1, 4)
					total_variable_cost2+=round(_cost2, 4)
					total_variable_cost3+=round(_cost3, 4)
					total_variable_cost4+=round(_cost4, 4)
					self.append("final_summary",{
						"label": row,
						"value1": round(_cost1, 4),
						"value2": round(_cost2, 4),
						"value3": round(_cost3, 4),
						"value4": round(_cost4, 4)
					})
				elif row=="Packaging":
					total_variable_cost1+=round(flt(self.packaging1_amt), 4)
					total_variable_cost2+=round(flt(self.packaging2_amt), 4)
					total_variable_cost3+=round(flt(self.packaging3_amt), 4)
					total_variable_cost4+=round(flt(self.packaging4_amt), 4)
					self.append("final_summary",{
						"label": row,
						"value1": round(self.packaging1_amt, 4),
						"value2": round(self.packaging2_amt, 4),
						"value3": round(self.packaging3_amt, 4),
						"value4": round(self.packaging4_amt, 4)
					})
				elif row=="Total Variable Cost":
					self.append("final_summary",{
						"label": row,
						"value1": round(total_variable_cost1, 4),
						"value2": round(total_variable_cost2, 4),
						"value3": round(total_variable_cost3, 4),
						"value4": round(total_variable_cost4, 4)
					})
				elif row=="Sampling & Development Charges %":
					self.append("final_summary",{
						"label": row,
						"value1": faze_doc.sampling,
						"value2": faze_doc.sampling,
						"value3": faze_doc.sampling,
						"value4": faze_doc.sampling
					})
				elif row=="Overheads %":
					self.append("final_summary",{
						"label": row,
						"value1": faze_doc.overheads,
						"value2": faze_doc.overheads,
						"value3": faze_doc.overheads,
						"value4": faze_doc.overheads
					})
				elif row=="Interest %":
					self.append("final_summary",{
						"label": row,
						"value1": faze_doc.interest,
						"value2": faze_doc.interest,
						"value3": faze_doc.interest,
						"value4": faze_doc.interest
					})
				elif row=="Profit %":
					self.append("final_summary",{
						"label": row,
						"value1": faze_doc.profit,
						"value2": faze_doc.profit,
						"value3": faze_doc.profit,
						"value4": faze_doc.profit
					})
				elif row=="DA+Store Return+Commission %":
					self.append("final_summary",{
						"label": row,
						"value1": faze_doc.da_store_return_commission,
						"value2": faze_doc.da_store_return_commission,
						"value3": faze_doc.da_store_return_commission,
						"value4": faze_doc.da_store_return_commission
					})
				elif row=="Sampling & Development Charges":
					_cost1 = total_variable_cost1*faze_doc.sampling/100
					_cost2 = total_variable_cost2*faze_doc.sampling/100
					_cost3 = total_variable_cost3*faze_doc.sampling/100
					_cost4 = total_variable_cost4*faze_doc.sampling/100
					sampling1=_cost1
					sampling2=_cost2
					sampling3=_cost3
					sampling4=_cost4
					total_variable_cost1+=round(_cost1, 4)
					total_variable_cost2+=round(_cost2, 4)
					total_variable_cost3+=round(_cost3, 4)
					total_variable_cost4+=round(_cost4, 4)
					self.append("final_summary",{
						"label": row,
						"value1": round(_cost1, 4),
						"value2": round(_cost2, 4),
						"value3": round(_cost3, 4),
						"value4": round(_cost4, 4)
					})
				elif row=="Overheads":
					_cost1 = total_variable_cost1*faze_doc.overheads/100
					_cost2 = total_variable_cost2*faze_doc.overheads/100
					_cost3 = total_variable_cost3*faze_doc.overheads/100
					_cost4 = total_variable_cost4*faze_doc.overheads/100
					overheads1=_cost1
					overheads2=_cost2
					overheads3=_cost3
					overheads4=_cost4
					total_variable_cost1+=round(_cost1, 4)
					total_variable_cost2+=round(_cost2, 4)
					total_variable_cost3+=round(_cost3, 4)
					total_variable_cost4+=round(_cost4, 4)
					self.append("final_summary",{
						"label": row,
						"value1": round(_cost1, 4),
						"value2": round(_cost2, 4),
						"value3": round(_cost3, 4),
						"value4": round(_cost4, 4)
					})
				elif row=="Interest":
					_cost1 = total_variable_cost1*faze_doc.interest/100
					_cost2 = total_variable_cost2*faze_doc.interest/100
					_cost3 = total_variable_cost3*faze_doc.interest/100
					_cost4 = total_variable_cost4*faze_doc.interest/100
					interest1=_cost1
					interest2=_cost2
					interest3=_cost3
					interest4=_cost4
					total_variable_cost1+=round(_cost1, 4)
					total_variable_cost2+=round(_cost2, 4)
					total_variable_cost3+=round(_cost3, 4)
					total_variable_cost4+=round(_cost4, 4)
					self.append("final_summary",{
						"label": row,
						"value1": round(_cost1, 4),
						"value2": round(_cost2, 4),
						"value3": round(_cost3, 4),
						"value4": round(_cost3, 4)
					})
				elif row=="Profit":
					_cost1 = total_variable_cost1*faze_doc.profit/100
					_cost2 = total_variable_cost2*faze_doc.profit/100
					_cost3 = total_variable_cost3*faze_doc.profit/100
					_cost4 = total_variable_cost4*faze_doc.profit/100
					profit1=_cost1
					profit2=_cost2
					profit3=_cost3
					profit4=_cost4
					total_variable_cost1+=round(_cost1, 4)
					total_variable_cost2+=round(_cost2, 4)
					total_variable_cost3+=round(_cost3, 4)
					total_variable_cost4+=round(_cost4, 4)
					self.append("final_summary",{
						"label": row,
						"value1": round(_cost1, 4),
						"value2": round(_cost2, 4),
						"value3": round(_cost3, 4),
						"value4": round(_cost4, 4)
					})
				elif row=="DA+Store Return+Commission":
					_cost1 = total_variable_cost1*faze_doc.da_store_return_commission/100
					_cost2 = total_variable_cost2*faze_doc.da_store_return_commission/100
					_cost3 = total_variable_cost3*faze_doc.da_store_return_commission/100
					_cost4 = total_variable_cost4*faze_doc.da_store_return_commission/100
					total_variable_cost1+=round(_cost1, 4)
					total_variable_cost2+=round(_cost2, 4)
					total_variable_cost3+=round(_cost3, 4)
					total_variable_cost4+=round(_cost4, 4)
					self.append("final_summary",{
						"label": row,
						"value1": round(_cost1, 4),
						"value2": round(_cost2, 4),
						"value3": round(_cost3, 4),
						"value4": round(_cost4, 4)
					})
				else:
					if row=="Total Cost":
						total_cost1+=final_product_cost[0].get(row)
						total_cost2+=final_product_cost[1].get(row)
						total_cost3+=final_product_cost[2].get(row)
						total_cost4+=final_product_cost[3].get(row)
					self.append("final_summary",{
						"label": row,
						"value1":final_product_cost[0].get(row),
						"value2":final_product_cost[1].get(row),
						"value3":final_product_cost[2].get(row),
						"value4":final_product_cost[3].get(row)
					})

		self.append("cost_in_inr",{
			"label": "Cost In INR",
			"value1": round(total_variable_cost1, 4),
			"value2": round(total_variable_cost2, 4),
			"value3": round(total_variable_cost3, 4),
			"value4": round(total_variable_cost4, 4)
		})
		
		total_cost_inr = [total_variable_cost1, total_variable_cost2, total_variable_cost3, total_variable_cost4]
		count=0

		contribution1 = sampling1+overheads1+interest1+profit1
		contribution2 = sampling2+overheads2+interest2+profit2
		contribution3 = sampling3+overheads3+interest3+profit3
		contribution4 = sampling4+overheads4+interest4+profit4
		contribution = [contribution1, contribution2, contribution3, contribution4]
		
		p_label = ["Total Variable Cost","Sampling & Development Charges", "Overheads", "Interest", "Profit"]
		total_cost_till_profit1=total_cost_till_profit2=total_cost_till_profit3=total_cost_till_profit4=0.0
		for row in self.final_summary:
			if row.label in p_label:
				total_cost_till_profit1+=flt(row.value1)
				total_cost_till_profit2+=flt(row.value2)
				total_cost_till_profit3+=flt(row.value3)
				total_cost_till_profit4+=flt(row.value4)

		profit = [total_cost_till_profit1, total_cost_till_profit2, total_cost_till_profit3, total_cost_till_profit4]

		for row in self.total_product_cost:
			exchange_rate = frappe.db.get_value("Currency", {"name":"USD"}, 'exchange_rate')	
			self.append("currency_summary",{
				"product_name": row.product_name,
				"_currency": "USD",
				"exchange_rate": exchange_rate,
				"manual_exch_rate": 0.0,
				"cost_in_inr": total_cost_inr[count],
				"cost_in_usd": total_cost_inr[count]/exchange_rate
			})
			self.append("control_summary",{
				"product_name": row.product_name,
				"contribution": contribution[count],
				"contribution_": (contribution[count]/profit[count])*100,
				"retail_cost": 0.0,
				"retail_": 0.0,
				"cost_in_inr": total_cost_inr[count],
				"cost_in_usd": total_cost_inr[count]/exchange_rate
			})
			count+=1
		return True
	

	@frappe.whitelist()
	def get_data_for_blend(self):
		final_blend = {}
		for row in self.warp_weight:
			if final_blend.get(row.yarn_input):
				final_blend[row.yarn_input]=flt(final_blend[row.yarn_input])+flt(row.wtlmt_in_grams)
			else:
				final_blend[row.yarn_input] = flt(row.wtlmt_in_grams)
		
		for row in self.weft_weight:
			if final_blend.get(row.yarn_input):
				final_blend[row.yarn_input]=flt(final_blend[row.yarn_input])+flt(row.wtlmt_in_grams)
			else:
				final_blend[row.yarn_input] = flt(row.wtlmt_in_grams)
		blend_ = 0.0
		for k, v in final_blend.items():
			if self.total_warp_weft_weight:
				blend_ = (flt(v)/flt(self.total_warp_weft_weight))*100
			self.append('final_yarn_blend_in_product',{
				'yarn': k,
				'blend_': blend_
			})

		return True

	@frappe.whitelist()
	def get_weaving_data(self):
		pick_rate = 0.0
		loom_master = frappe.db.get_value("Loom Master", {"machine":self.machine}, "name")
		if loom_master:
			loom_doc = frappe.get_doc("Loom Master", loom_master)
			for row in loom_doc.loom_item:
				if self.loom==row.loom:
					if flt(self.machine_size)<=flt(85):
						pick_rate = flt(row.get('85'))
					elif flt(self.machine_size)>flt(85) and flt(self.machine_size)<=flt(110):
						pick_rate = flt(row.get('110'))
					elif flt(self.machine_size)>flt(110) and flt(self.machine_size)<=flt(130):
						pick_rate = flt(row.get('130'))
					elif flt(self.machine_size)>flt(130) and flt(self.machine_size)<=flt(142):
						pick_rate = flt(row.get('142'))
					else:
						pick_rate = flt(row.get('169'))
						

		ppi = 0.0
		length = 0.0
		cost = 0.0
		for row in self.fabric:
			if row.norms=="PPI":
				ppi+=flt(row.on_loom)
			elif row.norms=="Length (In Inches)":
				length+=flt(row.on_loom)
	
		cost = ppi*(length/39.97)*pick_rate
		self.append("weaving_costs", {
			"machine_width": self.machine_size,
			"pick_rate": pick_rate,
			"cost": cost
		})
		return True

	#Calculate Final Summary Cost
	@frappe.whitelist()
	def get_final_summary_data(self):
		# self.set("final_summary", [])
		# self.set("currency_summary", [])
		# self.set("control_summary", [])
		rejection1 = rejection2 = rejection3 = rejection4 =0.0
		_cost1 = _cost2 = _cost3 = _cost4 =0.0
		total_cost1 = total_cost2 = total_cost3 = total_cost4 =0.0
		percent1 = percent2 = percent3 = percent4 =0.0
		total_variable_cost1 = total_variable_cost2 = total_variable_cost3 = total_variable_cost4 =0.0
		interest1 = interest2 = interest3 = interest4 = 0.0
		sampling1 = sampling2 = sampling3 = sampling4 = 0.0
		contribution1 = contribution2 = contribution3 = contribution4 = 0.0
		overheads1 = overheads2 = overheads3 = overheads4 = 0.0
		profit1 = profit2 = profit3 = profit4 = 0.0
		for row in self.final_summary:
			if row.label=="Rejection %":
				rejection1 = flt(row.value1)
				rejection2 = flt(row.value2) 
				rejection3 = flt(row.value3) 
				rejection4 = flt(row.value4)
			elif row.label=="Total Including Rejection":
				_cost1 = total_cost1+(total_cost1*rejection1/100)
				_cost2 = total_cost2+(total_cost2*rejection2/100)
				_cost3 = total_cost3+(total_cost3*rejection3/100)
				_cost4 = total_cost4+(total_cost4*rejection4/100)
				total_variable_cost1+=round(_cost1, 4)
				total_variable_cost2+=round(_cost2, 4)
				total_variable_cost3+=round(_cost3, 4)
				total_variable_cost4+=round(_cost4, 4)
				row.value1 = round(_cost1, 4)
				row.value2 = round(_cost2, 4)
				row.value3 = round(_cost3, 4)
				row.value4 = round(_cost4, 4)
			elif row.label=="Packaging":
				total_variable_cost1+=round(flt(self.packaging1_amt), 4)
				total_variable_cost2+=round(flt(self.packaging2_amt), 4)
				total_variable_cost3+=round(flt(self.packaging3_amt), 4)
				total_variable_cost4+=round(flt(self.packaging4_amt), 4)
				row.value1 = round(self.packaging1_amt, 4)
				row.value2 = round(self.packaging2_amt, 4)
				row.value3 = round(self.packaging3_amt, 4)
				row.value4 = round(self.packaging4_amt, 4)
			elif row.label=="Testing & Other Charges" or row.label=="Transport":
				total_variable_cost1+=round(flt(row.value1), 4)
				total_variable_cost2+=round(flt(row.value2), 4)
				total_variable_cost3+=round(flt(row.value3), 4)
				total_variable_cost4+=round(flt(row.value4), 4)
			elif row.label=="Total Variable Cost":
				row.value1 = round(total_variable_cost1, 4)
				row.value2 = round(total_variable_cost2, 4)
				row.value3 = round(total_variable_cost3, 4)
				row.value4 = round(total_variable_cost4, 4)
			elif row.label=="Sampling & Development Charges %" or row.label=="Overheads %" or row.label=="Interest %" or row.label=="Profit %" or row.label=="DA+Store Return+Commission %":
				percent1 = flt(row.value1)
				percent2 = flt(row.value2)
				percent3 = flt(row.value3)
				percent4 = flt(row.value4)
			elif row.label=="Sampling & Development Charges" or row.label=="Overheads" or row.label=="Interest" or row.label=="Profit" or row.label=="DA+Store Return+Commission":
				_cost1 = total_variable_cost1*percent1/100
				_cost2 = total_variable_cost2*percent2/100
				_cost3 = total_variable_cost3*percent3/100
				_cost4 = total_variable_cost4*percent4/100
				total_variable_cost1+=round(_cost1, 4)
				total_variable_cost2+=round(_cost2, 4)
				total_variable_cost3+=round(_cost3, 4)
				total_variable_cost4+=round(_cost4, 4)

				if row.label=="Sampling & Development Charges":
					sampling1=_cost1
					sampling2=_cost2
					sampling3=_cost3
					sampling4=_cost4
				elif row.label=="Interest":
					interest1=_cost1
					interest2=_cost2
					interest3=_cost3
					interest4=_cost4
				elif row.label=="Overheads":
					overheads1=_cost1
					overheads2=_cost2
					overheads3=_cost3
					overheads4=_cost4
				elif row.label=="Profit":
					profit1=_cost1
					profit2=_cost2
					profit3=_cost3
					profit4=_cost4

				row.value1 = round(_cost1, 4)
				row.value2 = round(_cost2, 4)
				row.value3 = round(_cost3, 4)
				row.value4 = round(_cost4, 4)
			else:
				if row.label=="Total Cost":
					total_cost1+=flt(row.value1)
					total_cost2+=flt(row.value2)
					total_cost3+=flt(row.value3)
					total_cost4+=flt(row.value4)

		label_lst = ["Product Name", "Total Fabric Cost", "Stitch Cost", "Made Up Cost", "No of Pieces", "Total Cost", "Rejection %", "Total Including Rejection", "Packaging", "Testing & Other Charges", "Transport", "Total Variable Cost", "Sampling & Development Charges %","Sampling & Development Charges", "Overheads %", "Overheads", "Interest %", "Interest", "Profit %", "Profit", "DA+Store Return+Commission %", "DA+Store Return+Commission"]

		for row in self.final_summary:
			if row.label not in label_lst:
				total_variable_cost1+=flt(row.value1)
				total_variable_cost2+=flt(row.value2)
				total_variable_cost3+=flt(row.value3)
				total_variable_cost4+=flt(row.value4)

		for row in self.cost_in_inr:
			row.value1 = round(total_variable_cost1, 4)
			row.value2 = round(total_variable_cost2, 4)
			row.value3 = round(total_variable_cost3, 4)
			row.value4 = round(total_variable_cost4, 4)
		
		total_cost_inr = [total_variable_cost1, total_variable_cost2, total_variable_cost3, total_variable_cost4]
		count=0
		exchange_rate=0
		contribution1 = sampling1+overheads1+interest1+profit1
		contribution2 = sampling2+overheads2+interest2+profit2
		contribution3 = sampling3+overheads3+interest3+profit3
		contribution4 = sampling4+overheads4+interest4+profit4
		contribution = [contribution1, contribution2, contribution3, contribution4]
		
		p_label = ["Total Variable Cost","Sampling & Development Charges", "Overheads", "Interest", "Profit"]
		total_cost_till_profit1=total_cost_till_profit2=total_cost_till_profit3=total_cost_till_profit4=0.0
		for row in self.final_summary:
			if row.label in p_label:
				total_cost_till_profit1+=flt(row.value1)
				total_cost_till_profit2+=flt(row.value2)
				total_cost_till_profit3+=flt(row.value3)
				total_cost_till_profit4+=flt(row.value4)
		
		profit = [total_cost_till_profit1, total_cost_till_profit2, total_cost_till_profit3, total_cost_till_profit4]

		cost_in_usd = 0.0
		for row in self.currency_summary:
			if row.manual_exch_rate:
				exchange_rate=flt(row.manual_exch_rate)
			else:
				exchange_rate=flt(row.exchange_rate)
			row.cost_in_inr = total_cost_inr[count]
			row.cost_in_usd = total_cost_inr[count]/exchange_rate 

			for r in self.control_summary:
				if row.product_name==r.product_name:
					cost_in_usd = total_cost_inr[count]/exchange_rate
					r.contribution = contribution[count]
					r.contribution_ = (contribution[count]/profit[count])*100
					if r.retail_cost:
						r.retail_ = cost_in_usd/r.retail_cost
					r.cost_in_inr = total_cost_inr[count]
					r.cost_in_usd =  cost_in_usd
			count+=1
					
		return True

	#Calculate Transport Details
	@frappe.whitelist()
	def calculate_transport_details(self):
		cubic_metres_cbm = 0.0
		net_amount = 0.0
		cubic_metres_cbm = (self.width*self.length*self.height)/1000000
		net_amount = cubic_metres_cbm*self.costcbm/self.no_of_piecescarton
		self.net_amount = net_amount
		return True

	#Add Transport Final Summary Cost
	@frappe.whitelist()
	def add_transport_in_final_summary(self):
		transport_amount = []
		for row in self.transport_details_table:
			transport_amount.append(round(row.net_amount, 4))

		for r in self.final_summary:
			if r.label=="Transport":
				if len(transport_amount)==4:
					r.value1 = transport_amount[0]
					r.value2 = transport_amount[1]
					r.value3 = transport_amount[2]
					r.value4 = transport_amount[3]
				elif len(transport_amount)==3:
					r.value1 = transport_amount[0]
					r.value2 = transport_amount[1]
					r.value3 = transport_amount[2]
				elif len(transport_amount)==2:
					r.value1 = transport_amount[0]
					r.value2 = transport_amount[1]
				else:
					r.value1 = transport_amount[0]

		rejection1 = rejection2 = rejection3 = rejection4 =0.0
		_cost1 = _cost2 = _cost3 = _cost4 =0.0
		total_cost1 = total_cost2 = total_cost3 = total_cost4 =0.0
		percent1 = percent2 = percent3 = percent4 =0.0
		total_variable_cost1 = total_variable_cost2 = total_variable_cost3 = total_variable_cost4 =0.0
		interest1 = interest2 = interest3 = interest4 = 0.0
		sampling1 = sampling2 = sampling3 = sampling4 = 0.0
		contribution1 = contribution2 = contribution3 = contribution4 = 0.0
		overheads1 = overheads2 = overheads3 = overheads4 = 0.0
		profit1 = profit2 = profit3 = profit4 = 0.0

		# self.set("currency_summary", [])
		# self.set("control_summary", [])

		for row in self.final_summary:
			if row.label=="Total Cost":
				total_cost1+=flt(row.value1)
				total_cost2+=flt(row.value2)
				total_cost3+=flt(row.value3)
				total_cost4+=flt(row.value4)


			if row.label=="Rejection %":
				rejection1 = flt(row.value1)
				rejection2 = flt(row.value2) 
				rejection3 = flt(row.value3) 
				rejection4 = flt(row.value4)
			elif row.label=="Total Including Rejection":
				_cost1 = total_cost1+(total_cost1*rejection1/100)
				_cost2 = total_cost2+(total_cost2*rejection2/100)
				_cost3 = total_cost3+(total_cost3*rejection3/100)
				_cost4 = total_cost4+(total_cost4*2/100)
				total_variable_cost1+=round(_cost1, 4)
				total_variable_cost2+=round(_cost2, 4)
				total_variable_cost3+=round(_cost3, 4)
				total_variable_cost4+=round(_cost4, 4)
				# row.value1 = round(_cost1, 4)
				# row.value2 = round(_cost2, 4)
				# row.value3 = round(_cost3, 4)
				# row.value4 = round(_cost4, 4)
			elif row.label=="Packaging":
				total_variable_cost1+=round(flt(self.packaging1_amt), 4)
				total_variable_cost2+=round(flt(self.packaging2_amt), 4)
				total_variable_cost3+=round(flt(self.packaging3_amt), 4)
				total_variable_cost4+=round(flt(self.packaging4_amt), 4)
				# row.value1 = round(self.packaging1_amt, 4)
				# row.value2 = round(self.packaging2_amt, 4)
				# row.value3 = round(self.packaging3_amt, 4)
				# row.value4 = round(self.packaging4_amt, 4)
			elif row.label=="Testing & Other Charges" or row.label=="Transport":
				total_variable_cost1+=round(flt(row.value1), 4)
				total_variable_cost2+=round(flt(row.value2), 4)
				total_variable_cost3+=round(flt(row.value3), 4)
				total_variable_cost4+=round(flt(row.value4), 4)
			elif row.label=="Total Variable Cost":
				row.value1 = round(total_variable_cost1, 4)
				row.value2 = round(total_variable_cost2, 4)
				row.value3 = round(total_variable_cost3, 4)
				row.value4 = round(total_variable_cost4, 4)
			elif row.label=="Sampling & Development Charges %" or row.label=="Overheads %" or row.label=="Interest %" or row.label=="Profit %" or row.label=="DA+Store Return+Commission %":
				percent1 = flt(row.value1)
				percent2 = flt(row.value2)
				percent3 = flt(row.value3)
				percent4 = flt(row.value4)
			elif row.label=="Sampling & Development Charges" or row.label=="Overheads" or row.label=="Interest" or row.label=="Profit" or row.label=="DA+Store Return+Commission":
				_cost1 = total_variable_cost1*percent1/100
				_cost2 = total_variable_cost2*percent2/100
				_cost3 = total_variable_cost3*percent3/100
				_cost4 = total_variable_cost4*percent4/100
				total_variable_cost1+=round(_cost1, 4)
				total_variable_cost2+=round(_cost2, 4)
				total_variable_cost3+=round(_cost3, 4)
				total_variable_cost4+=round(_cost4, 4)

				if row.label=="Sampling & Development Charges":
					sampling1=_cost1
					sampling2=_cost2
					sampling3=_cost3
					sampling4=_cost4
				elif row.label=="Interest":
					interest1=_cost1
					interest2=_cost2
					interest3=_cost3
					interest4=_cost4
				elif row.label=="Overheads":
					overheads1=_cost1
					overheads2=_cost2
					overheads3=_cost3
					overheads4=_cost4
				elif row.label=="Profit":
					profit1=_cost1
					profit2=_cost2
					profit3=_cost3
					profit4=_cost4

				# row.value1 = round(_cost1, 4)
				# row.value2 = round(_cost2, 4)
				# row.value3 = round(_cost3, 4)
				# row.value4 = round(_cost4, 4)

		for row in self.cost_in_inr:
			row.value1 = round(total_variable_cost1, 4)
			row.value2 = round(total_variable_cost2, 4)
			row.value3 = round(total_variable_cost3, 4)
			row.value4 = round(total_variable_cost4, 4)
		
		total_cost_inr = [total_variable_cost1, total_variable_cost2, total_variable_cost3, total_variable_cost4]
		count=0
		exchange_rate=0
		contribution1 = sampling1+overheads1+interest1+profit1
		contribution2 = sampling2+overheads2+interest2+profit2
		contribution3 = sampling3+overheads3+interest3+profit3
		contribution4 = sampling4+overheads4+interest4+profit4
		contribution = [contribution1, contribution2, contribution3, contribution4]
		
		p_label = ["Total Variable Cost","Sampling & Development Charges", "Overheads", "Interest", "Profit"]
		total_cost_till_profit1=total_cost_till_profit2=total_cost_till_profit3=total_cost_till_profit4=0.0
		for row in self.final_summary:
			if row.label in p_label:
				total_cost_till_profit1+=flt(row.value1)
				total_cost_till_profit2+=flt(row.value2)
				total_cost_till_profit3+=flt(row.value3)
				total_cost_till_profit4+=flt(row.value4)
		
		profit = [total_cost_till_profit1, total_cost_till_profit2, total_cost_till_profit3, total_cost_till_profit4]

		cost_in_usd = 0.0
		for row in self.currency_summary:
			if row.manual_exch_rate:
				exchange_rate=flt(row.manual_exch_rate)
			else:
				exchange_rate=flt(row.exchange_rate)
			row.cost_in_inr = total_cost_inr[count]
			row.cost_in_usd = total_cost_inr[count]/exchange_rate 

			for r in self.control_summary:
				if row.product_name==r.product_name:
					cost_in_usd = total_cost_inr[count]/exchange_rate
					r.contribution = contribution[count]
					r.contribution_ = (contribution[count]/profit[count])*100
					if r.retail_cost:
						r.retail_ = cost_in_usd/r.retail_cost
					r.cost_in_inr = total_cost_inr[count]
					r.cost_in_usd =  cost_in_usd
			count+=1

		return True


	@frappe.whitelist()
	def calculate_stitch_cost_and_made_up_cost(self):
		stitch_cost = []
		made_up_cost = []
		total_cost = []
		for row in self.total_product_cost:
			stitch_cost.append(row.stitch_cost)
			made_up_cost.append(row.made_up_cost)
			total_cost.append(row.total_cost)
		for r in self.final_summary:
			if r.label=="Stitch Cost":
				if len(stitch_cost)==4:
					r.value1 = stitch_cost[0]
					r.value2 = stitch_cost[1]
					r.value3 = stitch_cost[2]
					r.value4 = stitch_cost[3]
				elif len(stitch_cost)==3:
					r.value1 = stitch_cost[0]
					r.value2 = stitch_cost[1]
					r.value3 = stitch_cost[2]
				elif len(stitch_cost)==2:
					r.value1 = stitch_cost[0]
					r.value2 = stitch_cost[1]
				else:
					r.value1 = stitch_cost[0]
			elif r.label=="Made Up Cost":
				if len(made_up_cost)==4:
					r.value1 = made_up_cost[0]
					r.value2 = made_up_cost[1]
					r.value3 = made_up_cost[2]
					r.value4 = made_up_cost[3]
				elif len(made_up_cost)==3:
					r.value1 = made_up_cost[0]
					r.value2 = made_up_cost[1]
					r.value3 = made_up_cost[2]
				elif len(made_up_cost)==2:
					r.value1 = made_up_cost[0]
					r.value2 = made_up_cost[1]
				else:
					r.value1 = made_up_cost[0]
			elif r.label=="Total Cost":
				if len(total_cost)==4:
					r.value1 = round(total_cost[0], 4)
					r.value2 = round(total_cost[1], 4)
					r.value3 = round(total_cost[2], 4)
					r.value4 = round(total_cost[3], 4)
				elif len(total_cost)==3:
					r.value1 = round(total_cost[0], 4)
					r.value2 = round(total_cost[1], 4)
					r.value3 = round(total_cost[2], 4)
				elif len(total_cost)==2:
					r.value1 = round(total_cost[0], 4)
					r.value2 = round(total_cost[1], 4)
				else:
					r.value1 = round(total_cost[0], 4)


		rejection1 = rejection2 = rejection3 = rejection4 =0.0
		_cost1 = _cost2 = _cost3 = _cost4 =0.0
		total_cost1 = total_cost2 = total_cost3 = total_cost4 =0.0
		percent1 = percent2 = percent3 = percent4 =0.0
		total_variable_cost1 = total_variable_cost2 = total_variable_cost3 = total_variable_cost4 =0.0
		interest1 = interest2 = interest3 = interest4 = 0.0
		sampling1 = sampling2 = sampling3 = sampling4 = 0.0
		contribution1 = contribution2 = contribution3 = contribution4 = 0.0
		overheads1 = overheads2 = overheads3 = overheads4 = 0.0
		profit1 = profit2 = profit3 = profit4 = 0.0


		for row in self.final_summary:
			if row.label=="Total Cost":
				total_cost1+=flt(row.value1)
				total_cost2+=flt(row.value2)
				total_cost3+=flt(row.value3)
				total_cost4+=flt(row.value4)

			if row.label=="Rejection %":
				rejection1 = flt(row.value1)
				rejection2 = flt(row.value2) 
				rejection3 = flt(row.value3) 
				rejection4 = flt(row.value4)
			elif row.label=="Total Including Rejection":
				_cost1 = total_cost1+(total_cost1*rejection1/100)
				_cost2 = total_cost2+(total_cost2*rejection2/100)
				_cost3 = total_cost3+(total_cost3*rejection3/100)
				_cost4 = total_cost4+(total_cost4*2/100)
				total_variable_cost1+=round(_cost1, 4)
				total_variable_cost2+=round(_cost2, 4)
				total_variable_cost3+=round(_cost3, 4)
				total_variable_cost4+=round(_cost4, 4)
				# row.value1 = round(_cost1, 4)
				# row.value2 = round(_cost2, 4)
				# row.value3 = round(_cost3, 4)
				# row.value4 = round(_cost4, 4)
			elif row.label=="Packaging":
				total_variable_cost1+=round(flt(self.packaging1_amt), 4)
				total_variable_cost2+=round(flt(self.packaging2_amt), 4)
				total_variable_cost3+=round(flt(self.packaging3_amt), 4)
				total_variable_cost4+=round(flt(self.packaging4_amt), 4)
				# row.value1 = round(self.packaging1_amt, 4)
				# row.value2 = round(self.packaging2_amt, 4)
				# row.value3 = round(self.packaging3_amt, 4)
				# row.value4 = round(self.packaging4_amt, 4)
			elif row.label=="Testing & Other Charges" or row.label=="Transport":
				total_variable_cost1+=round(flt(row.value1), 4)
				total_variable_cost2+=round(flt(row.value2), 4)
				total_variable_cost3+=round(flt(row.value3), 4)
				total_variable_cost4+=round(flt(row.value4), 4)
			elif row.label=="Total Variable Cost":
				row.value1 = round(total_variable_cost1, 4)
				row.value2 = round(total_variable_cost2, 4)
				row.value3 = round(total_variable_cost3, 4)
				row.value4 = round(total_variable_cost4, 4)
			elif row.label=="Sampling & Development Charges %" or row.label=="Overheads %" or row.label=="Interest %" or row.label=="Profit %" or row.label=="DA+Store Return+Commission %":
				percent1 = flt(row.value1)
				percent2 = flt(row.value2)
				percent3 = flt(row.value3)
				percent4 = flt(row.value4)
			elif row.label=="Sampling & Development Charges" or row.label=="Overheads" or row.label=="Interest" or row.label=="Profit" or row.label=="DA+Store Return+Commission":
				_cost1 = total_variable_cost1*percent1/100
				_cost2 = total_variable_cost2*percent2/100
				_cost3 = total_variable_cost3*percent3/100
				_cost4 = total_variable_cost4*percent4/100
				total_variable_cost1+=round(_cost1, 4)
				total_variable_cost2+=round(_cost2, 4)
				total_variable_cost3+=round(_cost3, 4)
				total_variable_cost4+=round(_cost4, 4)

				if row.label=="Sampling & Development Charges":
					sampling1=_cost1
					sampling2=_cost2
					sampling3=_cost3
					sampling4=_cost4
				elif row.label=="Interest":
					interest1=_cost1
					interest2=_cost2
					interest3=_cost3
					interest4=_cost4
				elif row.label=="Overheads":
					overheads1=_cost1
					overheads2=_cost2
					overheads3=_cost3
					overheads4=_cost4
				elif row.label=="Profit":
					profit1=_cost1
					profit2=_cost2
					profit3=_cost3
					profit4=_cost4

		for row in self.cost_in_inr:
			row.value1 = round(total_variable_cost1, 4)
			row.value2 = round(total_variable_cost2, 4)
			row.value3 = round(total_variable_cost3, 4)
			row.value4 = round(total_variable_cost4, 4)
		
		total_cost_inr = [total_variable_cost1, total_variable_cost2, total_variable_cost3, total_variable_cost4]
		count=0
		exchange_rate=0
		contribution1 = sampling1+overheads1+interest1+profit1
		contribution2 = sampling2+overheads2+interest2+profit2
		contribution3 = sampling3+overheads3+interest3+profit3
		contribution4 = sampling4+overheads4+interest4+profit4
		contribution = [contribution1, contribution2, contribution3, contribution4]
		
		p_label = ["Total Variable Cost","Sampling & Development Charges", "Overheads", "Interest", "Profit"]
		total_cost_till_profit1=total_cost_till_profit2=total_cost_till_profit3=total_cost_till_profit4=0.0
		for row in self.final_summary:
			if row.label in p_label:
				total_cost_till_profit1+=flt(row.value1)
				total_cost_till_profit2+=flt(row.value2)
				total_cost_till_profit3+=flt(row.value3)
				total_cost_till_profit4+=flt(row.value4)
		
		profit = [total_cost_till_profit1, total_cost_till_profit2, total_cost_till_profit3, total_cost_till_profit4]

		cost_in_usd = 0.0
		for row in self.currency_summary:
			if row.manual_exch_rate:
				exchange_rate=flt(row.manual_exch_rate)
			else:
				exchange_rate=flt(row.exchange_rate)
			row.cost_in_inr = total_cost_inr[count]
			row.cost_in_usd = total_cost_inr[count]/exchange_rate 

			for r in self.control_summary:
				if row.product_name==r.product_name:
					cost_in_usd = total_cost_inr[count]/exchange_rate
					r.contribution = contribution[count]
					r.contribution_ = (contribution[count]/profit[count])*100
					if r.retail_cost:
						r.retail_ = cost_in_usd/r.retail_cost
					r.cost_in_inr = total_cost_inr[count]
					r.cost_in_usd =  cost_in_usd
			count+=1

		return True


@frappe.whitelist()
def get_data_for_peice_cut_sizes(product_name):
	data = frappe.db.sql("""SELECT front_back_filler, width, length, cut_width, cut_length From `tabItem Size` where parent='{0}'""".format(product_name), as_dict=1)
	return data

@frappe.whitelist()
def get_fabric_costing_summary_data(sheet_name):
	data = {} 
	d = frappe.get_doc("Dapada Cost Sheet", {"name":sheet_name})
	data["fabric_gsm"] = d.fabric_gsm

	for row in d.width_cost_per_linear_metre:
		data["cost"]=row.cost_per_lm
	for row in d.machine_details:
		if row.size_in=="Width (In Inches)":
			data["width"]=row.finished_size

	return data



