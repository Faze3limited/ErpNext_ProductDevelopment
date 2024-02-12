// Copyright (c) 2023, Indictrans and contributors
// For license information, please see license.txt

frappe.ui.form.on('Cost Estimate', {
	refresh: function(frm) {
		if (frm.doc.__islocal){
			var conversion_rate = 0.0
			// frappe.db.get_value("Fazethree Setting", {name: "Fazethree Setting"}, "exchange_rate", (r) => {
			// 	if (r.exchange_rate) {
			// 		conversion_rate = flt(frm.doc.conversion_rate)-flt(r.exchange_rate)
			// 		frm.set_value('conversion_rate', conversion_rate);
			// 	}
			// });
		}
	},

	validate: function(frm) {
		frm.trigger('calculation_on_material_cost_breakup')
		frm.trigger('calculation_on_cost_estimate')
		frm.set_value("variable_cost", frm.doc.total_variable_amount)
		// frm.trigger('currency_')
	},

	no_in_width: function(frm){
		var pile_face = 0.0
		$.each(frm.doc.yarn_dimensions_and_weight, function (idx, val) {
			pile_face=pile_face+val.grosstuft_width
		});
		pile_face=pile_face*frm.doc.no_in_width
		frm.set_value("pile_face", pile_face)
		frm.refresh_fields()
	},

	tuft_margin_width: function(frm){
		var grosstuft_width = 0.0
		var grosstuft_length = 0.0
		var stich_quantity = 0.0
		$.each(frm.doc.yarn_dimensions_and_weight, function (idx, val) {
			if (val.uom=="Inch"){
				grosstuft_width=Math.round(frm.doc.tuft_margin_width+val.width_in_cms)
				grosstuft_length=Math.round(frm.doc.tuft_margin_length+val.length_in_cms)
			} else {
				grosstuft_width=Math.round(frm.doc.tuft_margin_width+val.width_in_inches)
				grosstuft_length=Math.round(frm.doc.tuft_margin_length+val.length_in_cms)
			}
			frappe.model.set_value(val.doctype, val.name, 'grosstuft_width',grosstuft_width)
			refresh_field('grosstuft_width', val.name, 'yarn_dimensions_and_weight');
		});

		frm.trigger('calculation_on_material_cost_breakup')

		$.each(frm.doc.fixed_stiching_cost_table, function (idx, val) {
			frappe.db.get_value("Stitch Type", {name: val.stitch_type}, "uom", (r) => {
			if (r.uom) {
					if (r.uom=="Running Meters"){
						stich_quantity = (grosstuft_width+grosstuft_length)*2/100
						frappe.model.set_value(val.doctype, val.name, 'quantity',stich_quantity)
						frm.refresh_fields();
					} else {
						stich_quantity = (grosstuft_width+grosstuft_length)*2*val.per_running_meter
						frappe.model.set_value(val.doctype, val.name, 'quantity',stich_quantity)
						frm.refresh_fields();
					}
				}
			});
		});
	},

	tuft_margin_length: function(frm){
		var grosstuft_width = 0.0
		var stich_quantity = 0.0
		var grosstuft_length = 0.0
		$.each(frm.doc.yarn_dimensions_and_weight, function (idx, val) {
			if (val.uom=="Inch"){
				grosstuft_length=Math.round(frm.doc.tuft_margin_length+val.length_in_cms)
				grosstuft_width=Math.round(frm.doc.tuft_margin_width+val.width_in_cms)
			} else {
				grosstuft_length=Math.round(frm.doc.tuft_margin_length+val.length_in_inches)
				grosstuft_width=Math.round(frm.doc.tuft_margin_width+val.width_in_inches)
			}
			frappe.model.set_value(val.doctype, val.name, 'grosstuft_length',grosstuft_length)
			refresh_field('grosstuft_length', val.name, 'yarn_dimensions_and_weight');
		});
		frm.trigger('calculation_on_material_cost_breakup')

		$.each(frm.doc.fixed_stiching_cost_table, function (idx, val) {
			frappe.db.get_value("Stitch Type", {name: val.stitch_type}, "uom", (r) => {
			if (r.uom) {
					if (r.uom=="Running Meters"){
						stich_quantity = (grosstuft_width+grosstuft_length)*2/100
						frappe.model.set_value(val.doctype, val.name, 'quantity',stich_quantity)
						refresh_field('quantity', val.name, 'fixed_stiching_cost_table');
					} else {
						stich_quantity = (grosstuft_width+grosstuft_length)*2*val.per_running_meter
						frappe.model.set_value(val.doctype, val.name, 'quantity',stich_quantity)
						refresh_field('quantity', val.name, 'fixed_stiching_cost_table');
					}
				}
			});
		});
		// frm.refresh_fields();
	},

	backing_face: function(frm){
		var no_of_mats = 0.0
		var no_in_width = 0
		$.each(frm.doc.yarn_dimensions_and_weight, function (idx, val) {
			no_in_width = parseFloat(frm.doc.backing_face)/val.grosstuft_width
			no_of_mats=((100*100)/val.grosstuft_length)*Math.floor(no_in_width)
			frappe.model.set_value(val.doctype, val.name, 'no_of_mats_in_100_meters', Math.round(no_of_mats))
			frm.set_value("no_in_width", Math.floor(no_in_width))

		});

		frm.trigger('calculation_on_material_cost_breakup')
	},

	joint_wastage: function(frm){
		var total_packaging_amount = 0.0
		var amount = 0.0
		$.each(frm.doc.packaging, function (idx, val) {
			total_packaging_amount+=val.final_amount
		})
		amount = total_packaging_amount*(100+frm.doc.joint_wastage)/100
		frm.set_value("total_packaging_amount", amount)
	},

	joint_wastage_material: function(frm){
		var total_material_amount = 0.0
		var amount = 0.0
		$.each(frm.doc.material_cost_breakup, function (idx, val) {
			total_material_amount+=val.amount
		})

		amount = total_material_amount*(100+frm.doc.joint_wastage_material)/100
		frm.set_value("total_material_amount", amount)
	},

	calculation_on_material_cost_breakup: function(frm){
		var grosstuft_width = 0.0
		var grosstuft_length = 0.0
		var pile_rate = 0.0
		var quantity = 0.0
		var amount = 0.0
		var gsm = 0.0
		$.each(frm.doc.yarn_dimensions_and_weight, function (idx, val) {
			grosstuft_width=val.grosstuft_width
			grosstuft_length=val.grosstuft_length
		});
	
		$.each(frm.doc.material_cost_breakup, function (idx, val) {
			if (val.item_code=="Yarn: Pile"){
				pile_rate = val.rate
			}

			$.each(frm.doc.gsm_breakup_table, function (i, v) {
				if(val.item_code==v.item_code){
					gsm = parseFloat(v.gsm)/1000
				}
			})

			if (val.item_code=="PP Fabric"){
				quantity=((frm.doc.backing_face/frm.doc.no_in_width)*grosstuft_length)/10000
			} else {
				if (val.uom=="Kg"){
					quantity = ((grosstuft_width*grosstuft_length)/10000)*gsm
				} else {
					quantity = grosstuft_width*grosstuft_length/10000
				}
			}
			amount = (Math.ceil(quantity*val.rate)*(100+val.wastage_))/100
			frappe.model.set_value(val.doctype, val.name, 'qty', quantity)
			frappe.model.set_value(val.doctype, val.name, 'amount', amount)
		});

		var stich_quantity = 0.0
		$.each(frm.doc.fixed_stiching_cost_table, function (idx, val) {
			frappe.db.get_value("Stitch Type", {name: val.stitch_type}, "uom", (r) => {
				if (r.uom) {
					if (r.uom=="Running Meters"){
						stich_quantity = (grosstuft_width+grosstuft_length)*2/100
						frappe.model.set_value(val.doctype, val.name, 'quantity',stich_quantity)
						frm.refresh_fields();
					} else {
						stich_quantity = (grosstuft_width+grosstuft_length)*2*val.per_running_meter
						frappe.model.set_value(val.doctype, val.name, 'quantity',stich_quantity)
						frm.refresh_fields();
					}
				}
			});
		});
	}, 

	container: function(frm){
		var cubic_metres_cbm = 0.0
		var net_amount = 0.0
		cubic_metres_cbm = (frm.doc.width*frm.doc.length*frm.doc.height)/1000000
		frm.set_value("cubic_metres_cbm", cubic_metres_cbm)
		net_amount = frm.doc.cubic_metres_cbm*frm.doc.costcbm/frm.doc.no_of_piecescarton
		frm.set_value("net_amount", net_amount)
		frm.refresh_fields();
	},

	width: function(frm){
		var cubic_metres_cbm = 0.0
		cubic_metres_cbm = (frm.doc.width*frm.doc.length*frm.doc.height)/1000000
		frm.set_value("cubic_metres_cbm", cubic_metres_cbm)
		frm.refresh_fields();
	},

	length: function(frm){
		var cubic_metres_cbm = 0.0
		cubic_metres_cbm = (frm.doc.width*frm.doc.length*frm.doc.height)/1000000
		frm.set_value("cubic_metres_cbm", cubic_metres_cbm)
		frm.refresh_fields();
	},

	height: function(frm){
		var cubic_metres_cbm = 0.0
		cubic_metres_cbm = (frm.doc.width*frm.doc.length*frm.doc.height)/1000000
		frm.set_value("cubic_metres_cbm", cubic_metres_cbm)
		frm.refresh_fields();
	},

	calculation_on_cost_estimate: function(frm){
		var sum_cost=[]
		sum_cost.push({"cost_summary_label":"Material Cost Breakup", "amount":frm.doc.total_material_amount})
		sum_cost.push({"cost_summary_label":"Stitching", "amount":frm.doc.total_stiching_amount})
		sum_cost.push({"cost_summary_label":"Packaging", "amount":frm.doc.total_packaging_amount})
		sum_cost.push({"cost_summary_label":"Processing", "amount":frm.doc.total_processing_amount})
		var running_total = 0.0
		$.each(frm.doc.cost_summary_table, function (idx, val) {
			$.each(sum_cost, function (i, v) {
				if(v.cost_summary_label==val.cost_summary_label){
					running_total+=v.amount
					frappe.model.set_value(val.doctype, val.name, 'amount', v.amount);
					frappe.model.set_value(val.doctype, val.name, 'running_total', running_total);
				}
			});
		});
		frm.set_value("total_raw_materials_cut_sew_packaging_costs", running_total)

		$.each(frm.doc.others_summary_table, function (idx, val) {
			if(val.summary_label=="Rejection"){
				val.amount = (frm.doc.total_raw_materials_cut_sew_packaging_costs*val.input_value)/100
			} else if (val.summary_label=="Testing/Sample Devlopment & Others"){
				val.amount=val.input_value
			} else if (val.summary_label=="Transport"){
				val.amount=frm.doc.net_amount
			}
		});

		var other_runing = 0.0
		other_runing=frm.doc.total_raw_materials_cut_sew_packaging_costs
		$.each(frm.doc.others_summary_table, function (idx, val) {
			other_runing+=val.amount
			frappe.model.set_value(val.doctype, val.name, 'running_totals', other_runing)
		});
		frm.set_value("total_variable_amount", other_runing)
		frm.set_value("total_variable_running_amunt", other_runing)
		frm.set_value("variable_cost", other_runing)

		$.each(frm.doc.profit_and_interest_table, function (idx, val) {
			other_runing+=flt(val.amount)
			frappe.model.set_value(val.doctype, val.name, 'running_totals', other_runing)
		})
		frm.set_value("total_amount", other_runing)

		// var cost_percent = 0.0
		// var cost_per = 0.0
		// $.each(frm.doc.cost_summary_table, function (idx, val) {
		// 	cost_percent = (parseFloat(val.amount)/parseFloat(other_runing))*100
		// 	frappe.model.set_value(val.doctype, val.name, '_of_total_cost', cost_percent)
		// 	cost_per+=parseFloat(cost_percent.toFixed(2))
		// });

		// frm.set_value("total_raw_materials_cut_sew_packagin_percent", cost_per)

		// $.each(frm.doc.others_summary_table, function (idx, val) {
		// 	cost_percent = (parseFloat(val.amount)/parseFloat(other_runing))*100
		// 	frappe.model.set_value(val.doctype, val.name, '_of_total_cost', cost_percent)
		// 	cost_per+=parseFloat(cost_percent.toFixed(2))
		// });

		// frm.set_value("total_variable_amount_", cost_per)

		// $.each(frm.doc.profit_and_interest_table, function (idx, val) {
		// 	cost_percent = (parseFloat(val.amount)/parseFloat(other_runing))*100
		// 	frappe.model.set_value(val.doctype, val.name, '_of_total_cost', cost_percent)
		// 	cost_per+=parseFloat(cost_percent.toFixed(2))
		// });
		// frm.set_value("total_percent", Math.round(cost_per))
		// frm.trigger("control_summary_data")
		frm.refresh_fields()
	},

	total_amount: function(frm){
		var material_percent = 0.0
		var stiching_percent = 0.0
		var packaging_percent = 0.0
		var processing_percent = 0.0
		var transport_percent = 0.0
		var total_amount_in_usd = 0.0
		material_percent = (frm.doc.total_material_amount/frm.doc.total_amount)*100
		frm.set_value("material_percent", material_percent)
		stiching_percent = (frm.doc.total_stiching_amount/frm.doc.total_amount)*100
		frm.set_value("stiching_percent", stiching_percent)
		packaging_percent = (frm.doc.total_packaging_amount/frm.doc.total_amount)*100
		frm.set_value("packaging_percent", packaging_percent)
		processing_percent = (frm.doc.total_processing_amount/frm.doc.total_amount)*100
		frm.set_value("processing_percent", processing_percent)
		transport_percent = (frm.doc.net_amount/frm.doc.total_amount)*100
		frm.set_value("transport_percent", transport_percent)
		frm.set_value("price_inr", frm.doc.total_amount)
		frm.refresh_fields()
		// frm.trigger("calculation_on_cost_estimate")
		// frm.trigger("control_summary_data")
		if (frm.doc.manual_exchange_rate){
			total_amount_in_usd = (frm.doc.total_amount/frm.doc.manual_exchange_rate)
		} else {
			total_amount_in_usd = (frm.doc.total_amount/frm.doc.conversion_rate)
		}
		frm.set_value("total_amount_in_usd", total_amount_in_usd)
		frm.set_value("price_usd", total_amount_in_usd);
		frm.set_value("price_inr", parseFloat(frm.doc.total_amount.toFixed(2)))

		//=====Percentage Calculation=====//
		var cost_percent = 0.0
		var cost_per = 0.0
		$.each(frm.doc.cost_summary_table, function (idx, val) {
			cost_percent = (parseFloat(val.amount)/parseFloat(frm.doc.total_amount))*100
			frappe.model.set_value(val.doctype, val.name, '_of_total_cost', cost_percent)
			cost_per+=parseFloat(cost_percent.toFixed(2))
		});
		frm.set_value("total_raw_materials_cut_sew_packagin_percent", cost_per)

		$.each(frm.doc.others_summary_table, function (idx, val) {
			cost_percent = (parseFloat(val.amount)/parseFloat(frm.doc.total_amount))*100
			frappe.model.set_value(val.doctype, val.name, '_of_total_cost', cost_percent)
			cost_per+=parseFloat(cost_percent.toFixed(2))
		});

		frm.set_value("total_variable_amount_", cost_per)

		$.each(frm.doc.profit_and_interest_table, function (idx, val) {
			cost_percent = (parseFloat(val.amount)/parseFloat(frm.doc.total_amount))*100
			frappe.model.set_value(val.doctype, val.name, '_of_total_cost', cost_percent)
			cost_per+=parseFloat(cost_percent.toFixed(2))
		});
		frm.set_value("total_percent", Math.round(cost_per))

		// ##################Summary############################	
		var overheads=0.0
		var contribution=0.0
		var commission=0.0
		var summary_label = ["Overheads", "Interest", "Profit"]
		$.each(frm.doc.profit_and_interest_table, function (idx, val) {
			if (summary_label.includes(val.summary_label)){
				contribution+=val.amount
			}
			if (val.summary_label=="Overheads"){
				overheads+=val.amount
			}
			if (!summary_label.includes(val.summary_label)){
				commission+=val.amount
			}
		});

		frm.set_value("overheads", parseFloat(overheads.toFixed(2)))
		frm.set_value("contribution", parseFloat(contribution.toFixed(2)))
		var price_usd_sqmt=0.0
		price_usd_sqmt = frm.doc.price_usd/parseFloat(frm.doc.finished_sqmt.toFixed(2))
		frm.set_value("price_usd_sqmt", parseFloat(price_usd_sqmt.toFixed(2)))

		var price_inr_sqmt=0.0
		price_inr_sqmt = frm.doc.price_inr/parseFloat(frm.doc.finished_sqmt.toFixed(2))
		frm.set_value("price_inr_sqmt", parseFloat(price_inr_sqmt.toFixed(2)))

		var variable_cost_sqmt=0.0
		variable_cost_sqmt = frm.doc.variable_cost/parseFloat(frm.doc.finished_sqmt.toFixed(2))
		frm.set_value("variable_cost_sqmt", parseFloat(variable_cost_sqmt.toFixed(2)))

		var overheads_sqmt=0.0
		overheads_sqmt = frm.doc.overheads/parseFloat(frm.doc.finished_sqmt.toFixed(2))
		frm.set_value("overheads_sqmt", parseFloat(overheads_sqmt.toFixed(2)))

		var contribution_sqmt=0.0
		contribution_sqmt = frm.doc.contribution/parseFloat(frm.doc.finished_sqmt.toFixed(2))
		frm.set_value("contribution_sqmt", parseFloat(contribution_sqmt.toFixed(2)))

		var contribution_=0.0
		contribution_ = (frm.doc.contribution/(parseFloat(frm.doc.total_amount.toFixed(2)) - parseFloat(commission.toFixed(2))))*100
		frm.set_value("contribution_", parseFloat(contribution_.toFixed(2)))

		var realisation_kg=0.0
		realisation_kg = parseFloat(frm.doc.total_amount.toFixed(2))/parseFloat(frm.doc.weight.toFixed(2))
		frm.set_value("realisation_kg", parseFloat(realisation_kg.toFixed(2)))
		
		frm.refresh_fields()

	},

	control_summary_data: function(frm) {
		frm.set_value("price_inr", parseFloat(frm.doc.total_amount.toFixed(2)))
		var commission = 0.0
		var overheads=0.0
		var contribution=0.0
		var summary_label = ["Overheads", "Interest", "Profit"]
		$.each(frm.doc.profit_and_interest_table, function (idx, val) {
			if (summary_label.includes(val.summary_label)){
				contribution+=val.amount
			}
			if (val.summary_label=="Overheads"){
				overheads+=val.amount
			}
			if (!summary_label.includes(val.summary_label)){
				commission+=val.amount
			}
		});

		frm.set_value("overheads", parseFloat(overheads.toFixed(2)))
		frm.set_value("contribution", parseFloat(contribution.toFixed(2)))
		var price_usd_sqmt=0.0
		price_usd_sqmt = frm.doc.price_usd/parseFloat(frm.doc.finished_sqmt.toFixed(2))
		frm.set_value("price_usd_sqmt", parseFloat(price_usd_sqmt.toFixed(2)))

		var price_inr_sqmt=0.0
		price_inr_sqmt = frm.doc.price_inr/parseFloat(frm.doc.finished_sqmt.toFixed(2))
		frm.set_value("price_inr_sqmt", parseFloat(price_inr_sqmt.toFixed(2)))

		var variable_cost_sqmt=0.0
		variable_cost_sqmt = frm.doc.variable_cost/parseFloat(frm.doc.finished_sqmt.toFixed(2))
		frm.set_value("variable_cost_sqmt", parseFloat(variable_cost_sqmt.toFixed(2)))

		var overheads_sqmt=0.0
		overheads_sqmt = frm.doc.overheads/parseFloat(frm.doc.finished_sqmt.toFixed(2))
		frm.set_value("overheads_sqmt", parseFloat(overheads_sqmt.toFixed(2)))

		var contribution_sqmt=0.0
		contribution_sqmt = frm.doc.contribution/parseFloat(frm.doc.finished_sqmt.toFixed(2))
		frm.set_value("contribution_sqmt", parseFloat(contribution_sqmt.toFixed(2)))

		var contribution_=0.0
		contribution_ = (frm.doc.contribution/(parseFloat(frm.doc.total_amount.toFixed(2)) - parseFloat(commission.toFixed(2))))*100
		frm.set_value("contribution_", parseFloat(contribution_.toFixed(2)))

		var realisation_kg=0.0
		realisation_kg = parseFloat(frm.doc.total_amount.toFixed(2))/parseFloat(frm.doc.weight.toFixed(2))
		frm.set_value("realisation_kg", parseFloat(realisation_kg.toFixed(2)))
		frm.refresh_fields()
	},

	total_variable_amount: function(frm){
		frm.set_value("variable_cost", frm.doc.total_variable_amount)
		frm.refresh_fields()
	},

	total_material_amount: function(frm){
		var material_percent = 0.0
		material_percent = (frm.doc.total_material_amount/frm.doc.total_amount)*100
		frm.set_value("material_percent", material_percent)
		frm.trigger("calculation_on_cost_estimate")
		// frm.trigger("control_summary_data")
		frm.refresh_fields()
	},

	total_stiching_amount: function(frm){
		var stiching_percent = 0.0
		stiching_percent = (frm.doc.total_stiching_amount/frm.doc.total_amount)*100
		frm.set_value("stiching_percent", stiching_percent)
		frm.trigger("calculation_on_cost_estimate")
		// frm.trigger("control_summary_data")
		frm.refresh_fields()
	},

	total_packaging_amount: function(frm){
		var packaging_percent = 0.0
		packaging_percent = (frm.doc.total_packaging_amount/frm.doc.total_amount)*100
		frm.set_value("packaging_percent", packaging_percent)
		frm.trigger("calculation_on_cost_estimate")
		// frm.trigger("control_summary_data")
		frm.refresh_fields()
	},

	total_processing_amount: function(frm){
		var processing_percent = 0.0
		processing_percent = (frm.doc.total_processing_amount/frm.doc.total_amount)*100
		frm.set_value("processing_percent", processing_percent)
		frm.trigger("calculation_on_cost_estimate")
		// frm.trigger("control_summary_data")
		frm.refresh_fields()
	},

	net_amount: function(frm){
		var transport_percent = 0.0
		transport_percent = (frm.doc.net_amount/frm.doc.total_amount)*100
		frm.set_value("transport_percent", transport_percent)
		frm.trigger("calculation_on_cost_estimate")
		// frm.trigger("control_summary_data")
		frm.refresh_fields()
	},

	manual_exchange_rate: function(frm){
		var _total_amount = 0.0
		var price_usd_sqmt=0.0
		_total_amount = flt(frm.doc.total_amount)/frm.doc.manual_exchange_rate
		frm.set_value('total_amount_in_usd', _total_amount);
		frm.set_value("price_usd", _total_amount);
		price_usd_sqmt = frm.doc.price_usd/parseFloat(frm.doc.finished_sqmt.toFixed(2))
		frm.set_value("price_usd_sqmt", parseFloat(price_usd_sqmt.toFixed(2)))		
	}

});


frappe.ui.form.on('Fixed Stiching Cost Table', {
	per_running_meter: function(frm,cdt,cdn) {
		var row = locals[cdt][cdn];
		var total_gsm = 0.0
		var grosstuft_width = 0.0
		var grosstuft_length = 0.0
		var qty = 0.0
		var amount = 0.0 
		$.each(frm.doc.yarn_dimensions_and_weight, function (idx, val) {
			grosstuft_width=val.grosstuft_width
			grosstuft_length=val.grosstuft_length
		});

		if (row.stitch_type=="Labour Charges") {
			row.rate=row.per_running_meter
		}

		frappe.db.get_value("Stitch Type", {name: row.stitch_type}, "uom", (r) => {
			if (r.uom) {
				if (r.uom=="Running Meters"){
					qty = (grosstuft_width+grosstuft_length)*2/100
					amount=qty*row.rate
					frappe.model.set_value(cdt, cdn, 'quantity', qty)
					frappe.model.set_value(cdt, cdn, 'amount', amount)
					frm.refresh_fields();
				} else {
					qty = (grosstuft_width+grosstuft_length)*2*row.per_running_meter
					amount=qty*row.rate
					frappe.model.set_value(cdt, cdn, 'quantity', qty)
					frappe.model.set_value(cdt, cdn, 'amount', amount)
					frm.refresh_fields();
				}
			}
		});
	},

	quantity: function(frm,cdt,cdn) {
		var row = locals[cdt][cdn];
		var amount = 0.0
		amount=row.quantity*row.rate
		frappe.model.set_value(cdt, cdn, 'amount', amount)
		frm.refresh_fields();
	},

	rate: function(frm,cdt,cdn) {
		var row = locals[cdt][cdn];
		var amount = 0.0
		amount = row.quantity*row.rate
		frappe.model.set_value(cdt, cdn, 'amount', amount)
		frm.refresh_fields(); 
	},

	amount: function(frm){
		var amount = 0.0
		var stiching_percent = 0.0
		$.each(frm.doc.fixed_stiching_cost_table, function (idx, val) {
			amount+=val.amount
		})
		frm.set_value("total_stiching_amount", amount)
		stiching_percent = (frm.doc.total_stiching_amount/frm.doc.total_amount)*100
		frm.set_value("stiching_percent", stiching_percent)
		frm.refresh_fields();
	}
});

frappe.ui.form.on('Packaging', {
	rate: function(frm,cdt,cdn){
		var row = locals[cdt][cdn];
		var amount = 0.0
		var final_amount = 0.0
		amount = row.qty/row.rate
		row.amount=amount
		final_amount = amount+row.manual_addition
		frappe.model.set_value(cdt, cdn, 'final_amount', final_amount)
		frm.refresh_fields();
	},

	qty: function(frm,cdt,cdn){
		var amount = 0.0
		var final_amount = 0.0
		var row = locals[cdt][cdn];
		amount = row.qty/row.rate
		row.amount=amount
		final_amount = amount+row.manual_addition
		frappe.model.set_value(cdt, cdn, 'final_amount', final_amount)
		frm.refresh_fields();
	},

	manual_addition: function(frm,cdt,cdn) {
		var final_amount = 0.0
		var row = locals[cdt][cdn];
		final_amount = row.amount+row.manual_addition
		// row.final_amount = final_amount
		frappe.model.set_value(cdt, cdn, 'final_amount', final_amount)
		frm.refresh_fields();
	},

	final_amount: function(frm){
		var amount = 0.0
		$.each(frm.doc.packaging, function (idx, val) {
			amount+=val.final_amount
		})
		amount = (amount*(100+frm.doc.joint_wastage))/100
		frm.set_value("total_packaging_amount", amount)
		frm.refresh_fields();	
	}
});


frappe.ui.form.on('Material Cost Breakup', {
	rate: function(frm,cdt,cdn) {
		var amount = 0.0
		var over_rate = 0.0
		var row = locals[cdt][cdn];
		amount = (Math.ceil(row.qty*row.rate)*(100+row.wastage_))/100
		frappe.model.set_value(cdt, cdn, 'amount', amount)
		
		if (row.item_code=="Yarn: Pile"){
			$.each(frm.doc.fixed_stiching_cost_table, function (idx, val) {
				if (val.stitch_type=="Overlocking"){
					over_rate = row.rate/1000
					amount = (Math.ceil(row.qty*over_rate)*(100+row.wastage_))/100
					frappe.model.set_value(val.doctype, val.name, 'rate', over_rate)
					frappe.model.set_value(val.doctype, val.name, 'amount', amount)
				}

				if (val.stitch_type=="Over Edgeing"){
					over_rate = row.rate/1000
					amount = (Math.ceil(row.qty*over_rate)*(100+row.wastage_))/100
					frappe.model.set_value(val.doctype, val.name, 'rate', over_rate)
					frappe.model.set_value(val.doctype, val.name, 'amount', amount)
				}
			})
		}
		var total_amount = 0.0
		var material_percent = 0.0
		$.each(frm.doc.material_cost_breakup, function (idx, val) {
			total_amount+=val.amount
		})

		total_amount = (total_amount*(100+frm.doc.joint_wastage_material))/100
		frm.set_value("total_material_amount", total_amount)
		frm.refresh_fields();
	},

	wastage_: function(frm,cdt,cdn) {
		var amount = 0.0
		var row = locals[cdt][cdn];
		amount = (Math.ceil(row.qty*row.rate)*(100+row.wastage_))/100
		frappe.model.set_value(cdt, cdn, 'amount', amount)
		frm.refresh_fields();	
	},

	amount: function(frm){
		var amount = 0.0
		var material_percent = 0.0
		$.each(frm.doc.material_cost_breakup, function (idx, val) {
			amount+=val.amount
		})
		amount=(amount*(100+frm.doc.joint_wastage_material))/100
		frm.set_value("total_material_amount", amount)
		material_percent = (frm.doc.total_material_amount/frm.doc.total_amount)*100
		frm.set_value("material_percent", material_percent)
		frm.refresh_fields();
	}
});

frappe.ui.form.on('Processing Items Table', {
	rate: function(frm,cdt,cdn) {
		var amount = 0.0
		var row = locals[cdt][cdn];
		amount = row.rate*row.qty
		frappe.model.set_value(cdt, cdn, 'amount', amount)
		frm.refresh_fields();
	},
	amount: function(frm){
		var amount = 0.0
		var processing_percent = 0.0
		$.each(frm.doc.processing_items_table, function (idx, val) {
			amount+=val.amount
		})
		frm.set_value("total_processing_amount", amount)
		processing_percent = (frm.doc.total_processing_amount/frm.doc.total_amount)*100
		frm.set_value("processing_percent", processing_percent)
		frm.refresh_fields();
	}
});

frappe.ui.form.on('Others Summary Table', {
	input_value: function(frm, cdt, cdn) {
		var row = locals[cdt][cdn];
		var other_amt = 0.0
		other_amt=frm.doc.total_raw_materials_cut_sew_packaging_costs
		$.each(frm.doc.others_summary_table, function (idx, val) {
			if((row.summary_label=="Rejection") && row.summary_label==val.summary_label){
				val.amount = (frm.doc.total_raw_materials_cut_sew_packaging_costs*row.input_value)/100
				other_amt += val.amount
			} else if ((row.summary_label=="Testing/Sample Devlopment & Others") && row.summary_label==val.summary_label){
				val.amount=row.input_value
				other_amt += val.amount
			} else {
				other_amt += val.amount
			}
			frappe.model.set_value(val.doctype, val.name, 'running_totals', other_amt)
		});
		frm.set_value("total_variable_amount", other_amt)
		frm.set_value("total_variable_running_amunt", other_amt)
		frm.set_value("variable_cost", other_amt)

		var profit_amt = 0.0
		profit_amt=frm.doc.total_variable_amount
		$.each(frm.doc.profit_and_interest_table, function (idx, val) {
			val.amount=profit_amt*parseFloat(val.input_value)/100
			profit_amt+=val.amount
			frappe.model.set_value(val.doctype, val.name, 'running_totals', profit_amt)	
		})
		frm.set_value("total_amount", profit_amt)

		//=====Percentage Calculation=====//
		// var cost_percent = 0.0
		// var cost_per = 0.0
		// $.each(frm.doc.cost_summary_table, function (idx, val) {
		// 	cost_percent = (parseFloat(val.amount)/parseFloat(frm.doc.total_amount))*100
		// 	frappe.model.set_value(val.doctype, val.name, '_of_total_cost', cost_percent)
		// 	cost_per+=parseFloat(cost_percent.toFixed(2))
		// });
		// frm.set_value("total_raw_materials_cut_sew_packagin_percent", cost_per)

		// $.each(frm.doc.others_summary_table, function (idx, val) {
		// 	cost_percent = (parseFloat(val.amount)/parseFloat(frm.doc.total_amount))*100
		// 	frappe.model.set_value(val.doctype, val.name, '_of_total_cost', cost_percent)
		// 	cost_per+=parseFloat(cost_percent.toFixed(2))
		// });

		// frm.set_value("total_variable_amount_", cost_per)

		// $.each(frm.doc.profit_and_interest_table, function (idx, val) {
		// 	cost_percent = (parseFloat(val.amount)/parseFloat(frm.doc.total_amount))*100
		// 	frappe.model.set_value(val.doctype, val.name, '_of_total_cost', cost_percent)
		// 	cost_per+=parseFloat(cost_percent.toFixed(2))
		// });
		// frm.set_value("total_percent", Math.round(cost_per))

		// var material_percent = 0.0
		// var stiching_percent = 0.0
		// var packaging_percent = 0.0
		// var processing_percent = 0.0
		// var transport_percent = 0.0
		// material_percent = (frm.doc.total_material_amount/frm.doc.total_amount)*100
		// frm.set_value("material_percent", material_percent)
		// stiching_percent = (frm.doc.total_stiching_amount/frm.doc.total_amount)*100
		// frm.set_value("stiching_percent", stiching_percent)
		// packaging_percent = (frm.doc.total_packaging_amount/frm.doc.total_amount)*100
		// frm.set_value("packaging_percent", packaging_percent)
		// processing_percent = (frm.doc.total_processing_amount/frm.doc.total_amount)*100
		// frm.set_value("processing_percent", processing_percent)
		// transport_percent = (frm.doc.net_amount/frm.doc.total_amount)*100
		// frm.set_value("transport_percent", transport_percent)

		// var _total_amount = 0.0
		// if (frm.doc.manual_exchange_rate){
		// 	_total_amount = flt(frm.doc.total_amount)/frm.doc.manual_exchange_rate
		// } else {
		// 	_total_amount = flt(frm.doc.total_amount)/frm.doc.conversion_rate
		// }
		// frm.set_value('total_amount_in_usd', _total_amount);
		// frm.set_value("price_usd", _total_amount);
		// frm.set_value("price_inr", parseFloat(frm.doc.total_amount.toFixed(2)))

		// var overheads=0.0
		// var contribution=0.0
		// var commission=0.0
		// var summary_label = ["Overheads", "Interest", "Profit"]
		// $.each(frm.doc.profit_and_interest_table, function (idx, val) {
		// 	if (summary_label.includes(val.summary_label)){
		// 		contribution+=val.amount
		// 	}
		// 	if (val.summary_label=="Overheads"){
		// 		overheads+=val.amount
		// 	}
		// 	if (!summary_label.includes(val.summary_label)){
		// 		commission+=val.amount
		// 	}
		// });

		// frm.set_value("overheads", parseFloat(overheads.toFixed(2)))
		// frm.set_value("contribution", parseFloat(contribution.toFixed(2)))
		// var price_usd_sqmt=0.0
		// price_usd_sqmt = frm.doc.price_usd/parseFloat(frm.doc.finished_sqmt.toFixed(2))
		// frm.set_value("price_usd_sqmt", parseFloat(price_usd_sqmt.toFixed(2)))

		// var price_inr_sqmt=0.0
		// price_inr_sqmt = frm.doc.price_inr/parseFloat(frm.doc.finished_sqmt.toFixed(2))
		// frm.set_value("price_inr_sqmt", parseFloat(price_inr_sqmt.toFixed(2)))

		// var variable_cost_sqmt=0.0
		// variable_cost_sqmt = frm.doc.variable_cost/parseFloat(frm.doc.finished_sqmt.toFixed(2))
		// frm.set_value("variable_cost_sqmt", parseFloat(variable_cost_sqmt.toFixed(2)))

		// var overheads_sqmt=0.0
		// overheads_sqmt = frm.doc.overheads/parseFloat(frm.doc.finished_sqmt.toFixed(2))
		// frm.set_value("overheads_sqmt", parseFloat(overheads_sqmt.toFixed(2)))

		// var contribution_sqmt=0.0
		// contribution_sqmt = frm.doc.contribution/parseFloat(frm.doc.finished_sqmt.toFixed(2))
		// frm.set_value("contribution_sqmt", parseFloat(contribution_sqmt.toFixed(2)))

		// var contribution_=0.0
		// contribution_ = (frm.doc.contribution/(parseFloat(frm.doc.total_amount.toFixed(2)) - parseFloat(commission.toFixed(2))))*100
		// frm.set_value("contribution_", parseFloat(contribution_.toFixed(2)))

		// var realisation_kg=0.0
		// realisation_kg = parseFloat(frm.doc.total_amount.toFixed(2))/parseFloat(frm.doc.weight.toFixed(2))
		// frm.set_value("realisation_kg", parseFloat(realisation_kg.toFixed(2)))
		
		// frm.refresh_fields()	
	}
});

frappe.ui.form.on('Profit and Interest Table', {
	input_value: function(frm, cdt, cdn) {
		var row = locals[cdt][cdn];
		var profit_amt = 0.0
		profit_amt=frm.doc.total_variable_amount
		$.each(frm.doc.profit_and_interest_table, function (idx, val) {
			val.amount=profit_amt*parseFloat(val.input_value)/100
			profit_amt+=val.amount
			frappe.model.set_value(val.doctype, val.name, 'running_totals', profit_amt)	
		})
		frm.set_value("total_amount", profit_amt)

		//=====Percentage Calculation=====//
		// var cost_percent = 0.0
		// var cost_per = 0.0
		// $.each(frm.doc.cost_summary_table, function (idx, val) {
		// 	cost_percent = (parseFloat(val.amount)/parseFloat(frm.doc.total_amount))*100
		// 	frappe.model.set_value(val.doctype, val.name, '_of_total_cost', cost_percent)
		// 	cost_per+=parseFloat(cost_percent.toFixed(2))
		// });
		// frm.set_value("total_raw_materials_cut_sew_packagin_percent", cost_per)

		// $.each(frm.doc.others_summary_table, function (idx, val) {
		// 	cost_percent = (parseFloat(val.amount)/parseFloat(frm.doc.total_amount))*100
		// 	frappe.model.set_value(val.doctype, val.name, '_of_total_cost', cost_percent)
		// 	cost_per+=parseFloat(cost_percent.toFixed(2))
		// });

		// frm.set_value("total_variable_amount_", cost_per)

		// $.each(frm.doc.profit_and_interest_table, function (idx, val) {
		// 	cost_percent = (parseFloat(val.amount)/parseFloat(frm.doc.total_amount))*100
		// 	frappe.model.set_value(val.doctype, val.name, '_of_total_cost', cost_percent)
		// 	cost_per+=parseFloat(cost_percent.toFixed(2))
		// });
		// frm.set_value("total_percent", Math.round(cost_per))

		// var material_percent = 0.0
		// var stiching_percent = 0.0
		// var packaging_percent = 0.0
		// var processing_percent = 0.0
		// var transport_percent = 0.0
		// material_percent = (frm.doc.total_material_amount/frm.doc.total_amount)*100
		// frm.set_value("material_percent", material_percent)
		// stiching_percent = (frm.doc.total_stiching_amount/frm.doc.total_amount)*100
		// frm.set_value("stiching_percent", stiching_percent)
		// packaging_percent = (frm.doc.total_packaging_amount/frm.doc.total_amount)*100
		// frm.set_value("packaging_percent", packaging_percent)
		// processing_percent = (frm.doc.total_processing_amount/frm.doc.total_amount)*100
		// frm.set_value("processing_percent", processing_percent)
		// transport_percent = (frm.doc.net_amount/frm.doc.total_amount)*100
		// frm.set_value("transport_percent", transport_percent)

		// var _total_amount = 0.0
		// if (frm.doc.manual_exchange_rate){
		// 	_total_amount = flt(frm.doc.total_amount)/frm.doc.manual_exchange_rate
		// } else {
		// 	_total_amount = flt(frm.doc.total_amount)/frm.doc.conversion_rate
		// }
		// frm.set_value('total_amount_in_usd', _total_amount);
		// frm.set_value("price_usd", _total_amount);
		// frm.set_value("price_inr", parseFloat(frm.doc.total_amount.toFixed(2)))

		// var overheads=0.0
		// var contribution=0.0
		// var commission=0.0

		// var summary_label = ["Overheads", "Interest", "Profit"]
		// $.each(frm.doc.profit_and_interest_table, function (idx, val) {
		// 	if (summary_label.includes(val.summary_label)){
		// 		contribution+=val.amount
		// 	}

		// 	if (val.summary_label=="Overheads"){
		// 		overheads+=val.amount
		// 	}
		// 	if (!summary_label.includes(val.summary_label)){
		// 		commission+=val.amount
		// 	}
		// });

		// frm.set_value("overheads", parseFloat(overheads.toFixed(2)))
		// frm.set_value("contribution", parseFloat(contribution.toFixed(2)))
		// var price_usd_sqmt=0.0
		// price_usd_sqmt = frm.doc.price_usd/parseFloat(frm.doc.finished_sqmt.toFixed(2))
		// frm.set_value("price_usd_sqmt", parseFloat(price_usd_sqmt.toFixed(2)))

		// var price_inr_sqmt=0.0
		// price_inr_sqmt = frm.doc.price_inr/parseFloat(frm.doc.finished_sqmt.toFixed(2))
		// frm.set_value("price_inr_sqmt", parseFloat(price_inr_sqmt.toFixed(2)))

		// var variable_cost_sqmt=0.0
		// variable_cost_sqmt = frm.doc.variable_cost/parseFloat(frm.doc.finished_sqmt.toFixed(2))
		// frm.set_value("variable_cost_sqmt", parseFloat(variable_cost_sqmt.toFixed(2)))

		// var overheads_sqmt=0.0
		// overheads_sqmt = frm.doc.overheads/parseFloat(frm.doc.finished_sqmt.toFixed(2))
		// frm.set_value("overheads_sqmt", parseFloat(overheads_sqmt.toFixed(2)))

		// var contribution_sqmt=0.0
		// contribution_sqmt = frm.doc.contribution/parseFloat(frm.doc.finished_sqmt.toFixed(2))
		// frm.set_value("contribution_sqmt", parseFloat(contribution_sqmt.toFixed(2)))

		// var contribution_=0.0
		// contribution_ = (frm.doc.contribution/(parseFloat(frm.doc.total_amount.toFixed(2)) - parseFloat(commission.toFixed(2))))*100
		// frm.set_value("contribution_", parseFloat(contribution_.toFixed(2)))

		// var realisation_kg=0.0
		// realisation_kg = parseFloat(frm.doc.total_amount.toFixed(2))/parseFloat(frm.doc.weight.toFixed(2))
		// frm.set_value("realisation_kg", parseFloat(realisation_kg.toFixed(2)))
		// frm.refresh_fields()
	}
});