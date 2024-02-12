// Copyright (c) 2023, Indictrans and contributors
// For license information, please see license.txt

frappe.ui.form.on('Dapada Cost Sheet', {
	refresh: function(frm) {
		frm.toggle_enable(['warp_weight', 'weft_weight'], 0);
		// if(!frm.doc.packaging2[0]){
		// 	frm.toggle_enable('packaging2', 0);	
		// }
		// if(!frm.doc.packaging3[0]){
		// 	frm.toggle_enable('packaging3', 0);	
		// }
		// if(!frm.doc.packaging4[0]){
		// 	frm.toggle_enable('packaging4', 0);	
		// }

		var options = []
		$.each(frm.doc.fabric_costing_summary, function (idx, val) {
			options.push(val.sheet_name)
		})
		$.each(frm.doc.backing_other_fabric_cost, function (idx, val) {
			options.push(val.name1)
		})
		frm.fields_dict.peice_cut_sizes.grid.update_docfield_property( 'fabric', 'options', [''].concat(options));

		if(frm.doc.__islocal){
			var norms=["EPI", "PPI", "Width (In Inches)", "Length (In Inches)", "REED COUNT", "CRAMMING", "AVERAGE EPI", "Target GSM"]
			if(!frm.doc.fabric){
				$.each(norms, function (idx, val) {
					var d = frappe.model.add_child(frm.doc, "Fabric Details", "fabric");
					frappe.model.set_value(d.doctype, d.name, 'norms', val)
					if (val=="Length (In Inches)"){
						frappe.model.set_value(d.doctype, d.name, 'finished', 39.37)
					}
				})
			}

			var size = ["Width (In Inches)", "Length (In Inches)"]
			if(!frm.doc.machine_details){
				$.each(size, function (idx, val) {
					var d = frappe.model.add_child(frm.doc, "Machine Details", "machine_details");
					frappe.model.set_value(d.doctype, d.name, 'size_in', val)
				})
			}

			var crimp = ["Warp", "Weft"]
			if(!frm.doc.machine_detail){
				$.each(crimp, function (idx, val) {
					var d = frappe.model.add_child(frm.doc, "Machine Detail", "machine_detail");
					frappe.model.set_value(d.doctype, d.name, 'crimp_', val)
				})
			}
			frm.refresh_fields();
		}
		frm.trigger("apply_css_on_table")
		frm.trigger("filter_items")
	},

	apply_css_on_table: function(frm){
		cur_frm.get_field("final_summary").grid.grid_rows[7].columns.label.df.read_only = 1;
		cur_frm.get_field("final_summary").grid.grid_rows[7].columns.value1.df.read_only = 1;
		cur_frm.get_field("final_summary").grid.grid_rows[7].columns.value2.df.read_only = 1;
		cur_frm.get_field("final_summary").grid.grid_rows[7].columns.value3.df.read_only = 1;
		cur_frm.get_field("final_summary").grid.grid_rows[7].columns.value4.df.read_only = 1;

		cur_frm.get_field("final_summary").grid.grid_rows[13].columns.label.df.read_only = 1;
		cur_frm.get_field("final_summary").grid.grid_rows[13].columns.value1.df.read_only = 1;
		cur_frm.get_field("final_summary").grid.grid_rows[13].columns.value2.df.read_only = 1;
		cur_frm.get_field("final_summary").grid.grid_rows[13].columns.value3.df.read_only = 1;
		cur_frm.get_field("final_summary").grid.grid_rows[13].columns.value4.df.read_only = 1;

		cur_frm.get_field("final_summary").grid.grid_rows[15].columns.label.df.read_only = 1;
		cur_frm.get_field("final_summary").grid.grid_rows[15].columns.value1.df.read_only = 1;
		cur_frm.get_field("final_summary").grid.grid_rows[15].columns.value2.df.read_only = 1;
		cur_frm.get_field("final_summary").grid.grid_rows[15].columns.value3.df.read_only = 1;
		cur_frm.get_field("final_summary").grid.grid_rows[15].columns.value4.df.read_only = 1;

		cur_frm.get_field("final_summary").grid.grid_rows[17].columns.label.df.read_only = 1;
		cur_frm.get_field("final_summary").grid.grid_rows[17].columns.value1.df.read_only = 1;
		cur_frm.get_field("final_summary").grid.grid_rows[17].columns.value2.df.read_only = 1;
		cur_frm.get_field("final_summary").grid.grid_rows[17].columns.value3.df.read_only = 1;
		cur_frm.get_field("final_summary").grid.grid_rows[17].columns.value4.df.read_only = 1;

		cur_frm.get_field("final_summary").grid.grid_rows[19].columns.label.df.read_only = 1;
		cur_frm.get_field("final_summary").grid.grid_rows[19].columns.value1.df.read_only = 1;
		cur_frm.get_field("final_summary").grid.grid_rows[19].columns.value2.df.read_only = 1;
		cur_frm.get_field("final_summary").grid.grid_rows[19].columns.value3.df.read_only = 1;
		cur_frm.get_field("final_summary").grid.grid_rows[19].columns.value4.df.read_only = 1;

		cur_frm.get_field("final_summary").grid.grid_rows[21].columns.label.df.read_only = 1;
		cur_frm.get_field("final_summary").grid.grid_rows[21].columns.value1.df.read_only = 1;
		cur_frm.get_field("final_summary").grid.grid_rows[21].columns.value2.df.read_only = 1;
		cur_frm.get_field("final_summary").grid.grid_rows[21].columns.value3.df.read_only = 1;
		cur_frm.get_field("final_summary").grid.grid_rows[21].columns.value4.df.read_only = 1;

		cur_frm.fields_dict["final_summary"].$wrapper.find('.grid-body .rows').find(".grid-row").each(function(i, item) {
			let d = locals[cur_frm.fields_dict["final_summary"].grid.doctype][$(item).attr('data-name')];
			if(d["label"] == "Product Name"){
				$(item).find('.grid-static-col').css({'background-color': '#FF0000'});
				$(item).find('.grid-static-col').css({'readonly': true});
				// $(item).attr('readonly', true);
			// }
			// else{
			// 	$(item).find('.grid-static-col').css({'background-color': '#FFFFFF'});
			}
		});
	},

	filter_items: function(frm){
		frm.fields_dict['process'].grid.get_field('process_type').get_query = function(doc, cdt, cdn) {
			var row = locals[cdt][cdn];
			return {    
				filters:[
					['process_head_type', '=', row.process_head]
				]
			}
		}

		frm.set_query('product_name', function(){
			return {
				filters: {
					item_group: "Finished Products"
				}
			};
		});

		frm.fields_dict['warp'].grid.get_field('material').get_query = function(doc, cdt, cdn) {
			var row = locals[cdt][cdn];
			return {    
				filters:[
					['item_group', '=', "Raw Material"]
				]
			}
		}

		frm.fields_dict['weft'].grid.get_field('material').get_query = function(doc, cdt, cdn) {
			var row = locals[cdt][cdn];
			return {    
				filters:[
					['item_group', '=', "Raw Material"]
				]
			}
		}

		frm.fields_dict['packaging1'].grid.get_field('packing_components').get_query = function(doc, cdt, cdn) {
			var row = locals[cdt][cdn];
			return {    
				filters:[
					['item_group', '=', "Packaging Items"]
				]
			}
		}

		frm.fields_dict['packaging2'].grid.get_field('packing_components').get_query = function(doc, cdt, cdn) {
			var row = locals[cdt][cdn];
			return {    
				filters:[
					['item_group', '=', "Packaging Items"]
				]
			}
		}

		frm.fields_dict['packaging3'].grid.get_field('packing_components').get_query = function(doc, cdt, cdn) {
			var row = locals[cdt][cdn];
			return {    
				filters:[
					['item_group', '=', "Packaging Items"]
				]
			}
		}

		frm.fields_dict['packaging4'].grid.get_field('packing_components').get_query = function(doc, cdt, cdn) {
			var row = locals[cdt][cdn];
			return {    
				filters:[
					['item_group', '=', "Packaging Items"]
				]
			}
		}
	},

	validate: function(frm) {
		var cost_ = 0.0
		$.each(frm.doc.weaving_costs, function (idx, val) {
			cost_+=val.cost
		})
		$.each(frm.doc.weaving_processing_costs, function (idx, val) {
			cost_+=val.cost
		})
		cost_+=frm.doc.total_yarn_cost
		$.each(frm.doc.width_cost_per_linear_metre, function (idx, val) {
			cost_ = cost_+(cost_*(val.processing_wastage/100))
			frappe.model.set_value(val.doctype, val.name, "gsm", frm.doc.fabric_gsm)
			frappe.model.set_value(val.doctype, val.name, "cost_per_lm", cost_)
		})
		frm.refresh_fields()
	},

	machine_type: function(frm) {
		frm.set_value("machine", frm.doc.machine_type)
	},
	machine: function(frm) {
		frm.set_value("machine_type", frm.doc.machine)
		frm.trigger("weaving_costs_calculation")
	},
	machine_size: function(frm) {
		frm.trigger("weaving_costs_calculation")
	},
	// loom: function(frm) {
	// 	frm.trigger("weaving_costs_calculation")
	// },
	weaving_costs_calculation: function(frm) {
		frm.clear_table("weaving_costs")
		frappe.call({
			method: "get_weaving_data",
			freeze: true,
			doc: frm.doc,
			callback: function() {
				refresh_field("weaving_costs");
			}
		});
	},

	loom: function(frm) {
		frm.set_value("loom_used", frm.doc.loom)
		frm.trigger("weaving_costs_calculation")
	},
	loom_used: function(frm) {
		frm.set_value("loom", frm.doc.loom_used)	
	},
	dyeing_waste_: function(frm) {
		frm.set_value("dyeing_waste", frm.doc.dyeing_waste_)
	},
	dyeing_waste: function(frm){
		frm.set_value("dyeing_waste_", frm.doc.dyeing_waste)
		var width = 0.0
		var length = 0.0
		var fabric_gsm=0.0
		$.each(frm.doc.machine_details, function (idx, val) {
			if (val.size_in=="Width (In Inches)"){
				width+=val.finished_size
			} else {
				length+=val.finished_size
			}
		})

		fabric_gsm=((frm.doc.total_warp_weft_weight*39.37*39.37)/(width*length)*(1-frm.doc.dyeing_waste+100))/100
		frm.set_value("fabric_gsm", fabric_gsm)
		frm.refresh_fields()
	},

	process_costs_if_any: function(frm) {
		var processing_waste = 0.0
		var total_cost = 0.0
		var processing_waste = (frm.doc.fabric_cost+frm.doc.process_costs_if_any)*frm.doc._processing_waste/100
		total_cost = frm.doc.fabric_cost+frm.doc.process_costs_if_any+processing_waste
		frm.set_value("processing_waste", processing_waste)
		frm.set_value("total_cost", total_cost)
	},
	total_warp_weft_weight: function(frm) {
		var cost = 0.0
		var width = 0.0
		var length = 0.0
		var fabric_gsm = 0.0
		$.each(frm.doc.machine_details, function (idx, val) {
			if (val.size_in=="Width (In Inches)"){
				width+=val.finished_size
			} else if (val.size_in=="Length (In Inches)"){
				length+=val.finished_size
			}
		})

		$.each(frm.doc.weaving_processing_costs, function (idx, val) {
			if (val.uom=="Kg"){
				cost=(frm.doc.total_warp_weft_weight*val.rate_per_process)/1000
				frappe.model.set_value(val.doctype, val.name, 'cost', cost)
			} else {
				cost=(width*val.rate_per_process)/39.37
				frappe.model.set_value(val.doctype, val.name, 'cost', cost)
			}
		})
		fabric_gsm=((frm.doc.total_warp_weft_weight*39.37*39.37)/(width*length)*(1-frm.doc.dyeing_waste_+100))/100
		frm.set_value("fabric_gsm", fabric_gsm)

		frm.clear_table("final_yarn_blend_in_product")
		frappe.call({
			method: "get_data_for_blend",
			freeze: true,
			doc: frm.doc,
			callback: function() {
				refresh_field("final_yarn_blend_in_product");
			}
		});
		frm.refresh_fields()
	},

	total_yarn_cost: function(frm, cdt, cdn) {
		var cost_ = 0.0
		$.each(frm.doc.weaving_costs, function (idx, val) {
			cost_+=val.cost
		})
		$.each(frm.doc.weaving_processing_costs, function (idx, val) {
			cost_+=val.cost
		})
		cost_+=frm.doc.total_yarn_cost		
		frm.clear_table("fabric_costing_summary")

		$.each(frm.doc.width_cost_per_linear_metre, function (idx, val) {
			cost_ = cost_+(cost_*(val.processing_wastage/100))
			frappe.model.set_value(val.doctype, val.name, "gsm", frm.doc.fabric_gsm)
			frappe.model.set_value(val.doctype, val.name, "cost_per_lm", cost_)
		})

		var d = frappe.model.add_child(frm.doc, "Fabric Costing Summary", "fabric_costing_summary");
		frappe.model.set_value(d.doctype, d.name, "width", frm.doc.width)
		frappe.model.set_value(d.doctype, d.name, "gsm", frm.doc.fabric_gsm)
		frappe.model.set_value(d.doctype, d.name, "cost", cost_)
		frm.refresh_fields()
	},

	get_peice_for_fabric: function(frm,cdt, cdn){
		frm.clear_table("fabric_consumption")
		frm.clear_table("total_product_cost")
		frappe.call({
			method: "get_data_for_fabric_consumption",
			freeze: true,
			doc: frm.doc,
			callback: function() {
				if (frm.doc.packaging2[0]){
					frm.toggle_enable("packaging2", 1)
				}
				if (frm.doc.packaging3[0]){
					frm.toggle_enable("packaging3", 1)
				}
				if (frm.doc.packaging4[0]){
					frm.toggle_enable("packaging4", 1)
				}

				frm.refresh_fields();
			}
		});
	},

	packaging1_amt: function(frm, cdt, cdn) {
		frappe.call({
			method: "get_final_summary_data",
			freeze: true,
			doc: frm.doc,
			callback: function() {
				frm.refresh_fields();
			}
		});	
	},
	packaging2_amt: function(frm, cdt, cdn) {
		frappe.call({
			method: "get_final_summary_data",
			freeze: true,
			doc: frm.doc,
			callback: function() {
				frm.refresh_fields();
			}
		});	
	},
	packaging3_amt: function(frm, cdt, cdn) {
		frappe.call({
			method: "get_final_summary_data",
			freeze: true,
			doc: frm.doc,
			callback: function() {
				frm.refresh_fields();
			}
		});	
	},
	packaging4_amt: function(frm, cdt, cdn) {
		frappe.call({
			method: "get_final_summary_data",
			freeze: true,
			doc: frm.doc,
			callback: function() {
				frm.refresh_fields();
			}
		});	
	},


	container: function(frm){
		frappe.call({
			method: "calculate_transport_details",
			freeze: true,
			doc: frm.doc,
			callback: function() {
				frm.refresh_fields();
			}
		});
	},

	width: function(frm){
		frappe.call({
			method: "calculate_transport_details",
			freeze: true,
			doc: frm.doc,
			callback: function() {
				frm.refresh_fields();
			}
		});
	},

	length: function(frm){
		frappe.call({
			method: "calculate_transport_details",
			freeze: true,
			doc: frm.doc,
			callback: function() {
				frm.refresh_fields();
			}
		});
	},

	height: function(frm){
		frappe.call({
			method: "calculate_transport_details",
			freeze: true,
			doc: frm.doc,
			callback: function() {
				frm.refresh_fields();
			}
		});
	},

	fabric_gsm: function(frm){
		var cost = 0.0
		$.each(frm.doc.width_cost_per_linear_metre, function (idx, val) {
			cost = frm.doc.total_yarn_cost+(frm.doc.total_yarn_cost*(val.processing_wastage/100))
			frappe.model.set_value(val.doctype, val.name, "gsm", frm.doc.fabric_gsm)
			frappe.model.set_value(val.doctype, val.name, "cost_per_lm", cost)
		})
	}

});

frappe.ui.form.on('Warp Items', {
	number_of_ply: function(frm, cdt, cdn) {
		var row = locals[cdt][cdn]
		var final_count = 0.0
		frappe.db.get_value("Yarn Count", {name: row.yarn_count}, "yarn_type", (r) => {
			if (r.yarn_type=="Direct") {
				final_count = flt(row.yarn_count_input)*flt(row.number_of_ply)
				frappe.model.set_value(row.doctype, row.name, "final_count", final_count)
			} else {
				final_count = flt(row.yarn_count_input)/flt(row.number_of_ply)
				frappe.model.set_value(row.doctype, row.name, "final_count", final_count)
			}
		});
		
		frm.clear_table("yarn_details_for_warp")
		frm.clear_table("yarn_details_for_weft")
		frm.clear_table("warp_weight")
		frm.clear_table("weft_weight")
		var	count_in_ne = 0.0
		var length = 0.0
		var width = 0.0
		var epi = 0.0
		var ppi = 0.0
		var total_warp_weight = 0.0
		var total_weft_weight = 0.0
		var total_warp = 0.0
		var total_weft = 0.0
		var f_width = 0.0
		var f_length = 0.0
		$.each(frm.doc.machine_details, function (idx, val) {
			if (val.size_in=="Width (In Inches)"){
				width+=val.on_machine_size
				f_width+=val.finished_size
			} else {
				length+=val.on_machine_size
				f_length+=val.finished_size
			}
		})

		$.each(frm.doc.fabric, function (idx, val) {
			if (val.norms=="EPI"){
				epi+=val.on_loom
			} else if (val.norms=="PPI"){
				ppi+=val.on_loom
			}
		})

		$.each(frm.doc.warp, function (idx, val) {
			if (val.yarn_type=="Direct") {
				final_count = flt(val.yarn_count_input)*flt(val.number_of_ply)
				frappe.model.set_value(val.doctype, val.name, "final_count", final_count)
			} else {
				final_count = flt(val.yarn_count_input)/flt(val.number_of_ply)
				frappe.model.set_value(val.doctype, val.name, "final_count", final_count)
			}
			if (val.percent_used > 0){
				var d = frappe.model.add_child(frm.doc, "Yarn Details for WARP", "yarn_details_for_warp");
				frappe.model.set_value(d.doctype, d.name, "input_yarn_quality", val.material)
				frappe.model.set_value(d.doctype, d.name, "_used", val.percent_used)
				frappe.model.set_value(d.doctype, d.name, "yarn_count", val.yarn_count)
				frappe.model.set_value(d.doctype, d.name, "yarn_count_input", final_count)
				total_warp+=val.percent_used

				var warp_weight = frappe.model.add_child(frm.doc, "WARP Weight", "warp_weight");
				frappe.model.set_value(warp_weight.doctype, warp_weight.name, "yarn_quality", val.material)
				frappe.model.set_value(warp_weight.doctype, warp_weight.name, "weaving_waste", val.weaving_waste)
				frappe.model.set_value(warp_weight.doctype, warp_weight.name, "yarn_input", val.input_yarn)
				if (val.yarn_type=="Direct") {
					count_in_ne = flt(val.yarn_conversion_value)/flt(final_count)
					frappe.model.set_value(warp_weight.doctype, warp_weight.name, "count_in_ne", count_in_ne)
				} else {
					count_in_ne = flt(val.yarn_conversion_value)*flt(final_count)
					frappe.model.set_value(warp_weight.doctype, warp_weight.name, "count_in_ne", count_in_ne)
				}
				var weight_ = ((epi*width)*(length/39.37)*5315/(9000*count_in_ne))*(val.percent_used/100)
				if (Number.isNaN(weight_)){
					frappe.model.set_value(warp_weight.doctype, warp_weight.name, "wtlmt_in_grams", 0.0)
				} else {
					frappe.model.set_value(warp_weight.doctype, warp_weight.name, "wtlmt_in_grams", flt(weight_))
				}
				frappe.model.set_value(warp_weight.doctype, warp_weight.name, "price", val.grey_yarn_price)
				total_warp_weight+=weight_
			}
		})

		$.each(frm.doc.weft, function (idx, val) {
			if (val.yarn_type=="Direct") {
				final_count = flt(val.yarn_count_input)*flt(val.number_of_ply)
				frappe.model.set_value(val.doctype, val.name, "final_count", final_count)
			} else {
				final_count = flt(val.yarn_count_input)/flt(val.number_of_ply)
				frappe.model.set_value(val.doctype, val.name, "final_count", final_count)
			}

			if (val.percent_used > 0){
				var d = frappe.model.add_child(frm.doc, "Yarn Details for WEFT", "yarn_details_for_weft");
				frappe.model.set_value(d.doctype, d.name, "input_yarn_quality", val.material)
				frappe.model.set_value(d.doctype, d.name, "_used", val.percent_used)
				frappe.model.set_value(d.doctype, d.name, "yarn_count", val.yarn_count)
				frappe.model.set_value(d.doctype, d.name, "yarn_count_input", final_count)
				total_weft+=val.percent_used

				var weft_weight = frappe.model.add_child(frm.doc, "WEFT Weight", "weft_weight");
				frappe.model.set_value(weft_weight.doctype, weft_weight.name, "yarn_quality", val.material)
				frappe.model.set_value(weft_weight.doctype, weft_weight.name, "weaving_waste", val.weaving_waste)
				frappe.model.set_value(weft_weight.doctype, weft_weight.name, "yarn_input", val.input_yarn)
				if (val.yarn_type=="Direct") {
					count_in_ne = flt(val.yarn_conversion_value)/flt(final_count)
					frappe.model.set_value(weft_weight.doctype, weft_weight.name, "count_in_ne", count_in_ne)
				} else {
					count_in_ne = flt(val.yarn_conversion_value)*flt(final_count)
					frappe.model.set_value(weft_weight.doctype, weft_weight.name, "count_in_ne", count_in_ne)
				}
				var weight_ = ((ppi*width)*(length/39.37)*5315/(9000*count_in_ne))*(val.percent_used/100)
				if (Number.isNaN(weight_)){
					frappe.model.set_value(weft_weight.doctype, weft_weight.name, "wtlmt_in_grams", 0.0)
				} else {
					frappe.model.set_value(weft_weight.doctype, weft_weight.name, "wtlmt_in_grams", flt(weight_))
				}
				frappe.model.set_value(weft_weight.doctype, weft_weight.name, "price", val.grey_yarn_price)
				total_weft_weight+=weight_
			}
		})

		var total_weight = 0.0
		var fabric_gsm = 0.0
		frm.set_value("total_warp", total_warp)
		frm.set_value("total_weft", total_weft)
		total_weight = total_weft_weight+total_warp_weight
		frm.set_value("total_weft_weight", total_weft_weight)
		frm.set_value("total_warp_weight", total_warp_weight)
		frm.set_value("total_warp_weft_weight", total_weft_weight+total_warp_weight)
		fabric_gsm=((total_weight*39.37*39.37)/(f_width*f_length)*(1-frm.doc.dyeing_waste_+100))/100
		frm.set_value("fabric_gsm", fabric_gsm)
		frm.refresh_fields();
	},

	material: function(frm, cdt, cdn) {
		var row = locals[cdt][cdn]
		frm.clear_table("yarn_details_for_warp")
		frm.clear_table("yarn_details_for_weft")
		frm.clear_table("warp_weight")
		frm.clear_table("weft_weight")
		var	count_in_ne = 0.0
		var length = 0.0
		var width = 0.0
		var epi = 0.0
		var ppi = 0.0
		var total_warp_weight = 0.0
		var total_weft_weight = 0.0
		var total_warp = 0.0
		var total_weft = 0.0
		var f_width = 0.0
		var f_length = 0.0
		$.each(frm.doc.machine_details, function (idx, val) {
			if (val.size_in=="Width (In Inches)"){
				width+=val.on_machine_size
				f_width+=val.finished_size
			} else {
				length+=val.on_machine_size
				f_length+=val.finished_size
			}
		})

		$.each(frm.doc.fabric, function (idx, val) {
			if (val.norms=="EPI"){
				epi+=val.on_loom
			} else if (val.norms=="PPI"){
				ppi+=val.on_loom
			}
		})

		$.each(frm.doc.warp, function (idx, val) {
			if (val.percent_used > 0){
				var d = frappe.model.add_child(frm.doc, "Yarn Details for WARP", "yarn_details_for_warp");
				frappe.model.set_value(d.doctype, d.name, "input_yarn_quality", val.material)
				frappe.model.set_value(d.doctype, d.name, "_used", val.percent_used)
				frappe.model.set_value(d.doctype, d.name, "yarn_count", val.yarn_count)
				frappe.model.set_value(d.doctype, d.name, "yarn_count_input", val.yarn_count_input)
				total_warp+=val.percent_used

				var warp_weight = frappe.model.add_child(frm.doc, "WARP Weight", "warp_weight");
				frappe.model.set_value(warp_weight.doctype, warp_weight.name, "yarn_quality", val.material)
				frappe.model.set_value(warp_weight.doctype, warp_weight.name, "weaving_waste", val.weaving_waste)
				frappe.model.set_value(warp_weight.doctype, warp_weight.name, "yarn_input", val.input_yarn)
				if (val.yarn_type=="Direct") {
					count_in_ne = flt(val.yarn_conversion_value)/flt(val.final_count)
					frappe.model.set_value(warp_weight.doctype, warp_weight.name, "count_in_ne", count_in_ne)
				} else {
					count_in_ne = flt(val.yarn_conversion_value)*flt(val.final_count)
					frappe.model.set_value(warp_weight.doctype, warp_weight.name, "count_in_ne", count_in_ne)
				}
				var weight_ = ((epi*width)*(length/39.37)*5315/(9000*count_in_ne))*(val.percent_used/100)
				if (Number.isNaN(weight_)){
					frappe.model.set_value(warp_weight.doctype, warp_weight.name, "wtlmt_in_grams", 0.0)
				} else {
					frappe.model.set_value(warp_weight.doctype, warp_weight.name, "wtlmt_in_grams", flt(weight_))
				}
				frappe.model.set_value(warp_weight.doctype, warp_weight.name, "price", val.grey_yarn_price)
				total_warp_weight+=weight_
			}
		})

		$.each(frm.doc.weft, function (idx, val) {
			if (val.percent_used > 0){
				var d = frappe.model.add_child(frm.doc, "Yarn Details for WEFT", "yarn_details_for_weft");
				frappe.model.set_value(d.doctype, d.name, "input_yarn_quality", val.material)
				frappe.model.set_value(d.doctype, d.name, "_used", val.percent_used)
				frappe.model.set_value(d.doctype, d.name, "yarn_count", val.yarn_count)
				frappe.model.set_value(d.doctype, d.name, "yarn_count_input", val.yarn_count_input)
				total_weft+=val.percent_used

				var weft_weight = frappe.model.add_child(frm.doc, "WEFT Weight", "weft_weight");
				frappe.model.set_value(weft_weight.doctype, weft_weight.name, "yarn_quality", val.material)
				frappe.model.set_value(weft_weight.doctype, weft_weight.name, "weaving_waste", val.weaving_waste)
				frappe.model.set_value(weft_weight.doctype, weft_weight.name, "yarn_input", val.input_yarn)
				if (val.yarn_type=="Direct") {
					count_in_ne = flt(val.yarn_conversion_value)/flt(val.final_count)
					frappe.model.set_value(weft_weight.doctype, weft_weight.name, "count_in_ne", count_in_ne)
				} else {
					count_in_ne = flt(val.yarn_conversion_value)*flt(val.final_count)
					frappe.model.set_value(weft_weight.doctype, weft_weight.name, "count_in_ne", count_in_ne)
				}
				var weight_ = ((ppi*width)*(length/39.37)*5315/(9000*count_in_ne))*(val.percent_used/100)
				if (Number.isNaN(weight_)){
					frappe.model.set_value(weft_weight.doctype, weft_weight.name, "wtlmt_in_grams", 0.0)
				} else {
					frappe.model.set_value(weft_weight.doctype, weft_weight.name, "wtlmt_in_grams", flt(weight_))
				}
				frappe.model.set_value(weft_weight.doctype, weft_weight.name, "price", val.grey_yarn_price)
				total_weft_weight+=weight_
			}
		})

		var total_weight = 0.0
		var fabric_gsm = 0.0
		frm.set_value("total_warp", total_warp)
		frm.set_value("total_weft", total_weft)
		total_weight = total_weft_weight+total_warp_weight
		frm.set_value("total_weft_weight", total_weft_weight)
		frm.set_value("total_warp_weight", total_warp_weight)
		frm.set_value("total_warp_weft_weight", total_weft_weight+total_warp_weight)
		fabric_gsm=((total_weight*39.37*39.37)/(f_width*f_length)*(1-frm.doc.dyeing_waste_+100))/100
		frm.set_value("fabric_gsm", fabric_gsm)
		frm.refresh_fields();
	},
	percent_used: function(frm, cdt, cdn) {
		var row = locals[cdt][cdn]
		var total_warp = 0.0
		var total_weft = 0.0
		frm.clear_table("yarn_details_for_warp")
		frm.clear_table("yarn_details_for_weft")
		$.each(frm.doc.warp, function (idx, val) {
			if (val.percent_used > 0){
				var d = frappe.model.add_child(frm.doc, "Yarn Details for WARP", "yarn_details_for_warp");
				frappe.model.set_value(d.doctype, d.name, "input_yarn_quality", val.material)
				frappe.model.set_value(d.doctype, d.name, "_used", val.percent_used)
				frappe.model.set_value(d.doctype, d.name, "yarn_count", val.yarn_count)
				frappe.model.set_value(d.doctype, d.name, "yarn_count_input", val.yarn_count_input)
				total_warp+=val.percent_used
			}
		})

		$.each(frm.doc.weft, function (idx, val) {
			if (val.percent_used > 0){
				var d = frappe.model.add_child(frm.doc, "Yarn Details for WEFT", "yarn_details_for_weft");
				frappe.model.set_value(d.doctype, d.name, "input_yarn_quality", val.material)
				frappe.model.set_value(d.doctype, d.name, "_used", val.percent_used)
				frappe.model.set_value(d.doctype, d.name, "yarn_count", val.yarn_count)
				frappe.model.set_value(d.doctype, d.name, "yarn_count_input", val.yarn_count_input)
				total_weft+=val.percent_used
			}
		})
		frm.set_value("total_warp", total_warp)
		frm.set_value("total_weft", total_weft)
		frm.refresh_fields();
	},
	yarn_count: function(frm, cdt, cdn) {
		var row = locals[cdt][cdn]
		var total_warp = 0.0
		var total_weft = 0.0
		frm.clear_table("yarn_details_for_warp")
		frm.clear_table("yarn_details_for_weft")
		$.each(frm.doc.warp, function (idx, val) {
			if (val.percent_used > 0){
				var d = frappe.model.add_child(frm.doc, "Yarn Details for WARP", "yarn_details_for_warp");
				frappe.model.set_value(d.doctype, d.name, "input_yarn_quality", val.material)
				frappe.model.set_value(d.doctype, d.name, "_used", val.percent_used)
				frappe.model.set_value(d.doctype, d.name, "yarn_count", val.yarn_count)
				frappe.model.set_value(d.doctype, d.name, "yarn_count_input", val.final_count)
				total_warp+=val.percent_used
			}
		})

		$.each(frm.doc.weft, function (idx, val) {
			if (val.percent_used > 0){
				var d = frappe.model.add_child(frm.doc, "Yarn Details for WEFT", "yarn_details_for_weft");
				frappe.model.set_value(d.doctype, d.name, "input_yarn_quality", val.material)
				frappe.model.set_value(d.doctype, d.name, "_used", val.percent_used)
				frappe.model.set_value(d.doctype, d.name, "yarn_count", val.yarn_count)
				frappe.model.set_value(d.doctype, d.name, "yarn_count_input", val.final_count)
				total_weft+=val.percent_used
			}
		})
		frm.set_value("total_warp", total_warp)
		frm.set_value("total_weft", total_weft)
		frm.refresh_fields();
	},

	weaving_waste: function(frm, cdt, cdn){
		var length = 0.0
		var width = 0.0
		var epi = 0.0
		var ppi = 0.0
		var total_warp_weight = 0.0
		var total_weft_weight = 0.0
		var total_yarn_cost = 0.0
		frm.clear_table("warp_weight")
		frm.clear_table("weft_weight")
		frm.clear_table("warp_yarn_cost")
		frm.clear_table("weft_yarn_cost")
		var f_length = 0.0
		var f_width = 0.0
		$.each(frm.doc.machine_details, function (idx, val) {
			if (val.size_in=="Width (In Inches)"){
				width+=val.on_machine_size
				f_width+=val.finished_size
			} else {
				length+=val.on_machine_size
				f_length+=val.finished_size
			}
		})

		$.each(frm.doc.fabric, function (idx, val) {
			if (val.norms=="EPI"){
				epi+=val.on_loom
			} else if (val.norms=="PPI"){
				ppi+=val.on_loom
			}
		})

		$.each(frm.doc.warp, function (idx, val) {
			var count_in_ne = 0.0
			var weight_ = 0.0 
			if (val.percent_used > 0){
				var warp_weight = frappe.model.add_child(frm.doc, "WARP Weight", "warp_weight");
				frappe.model.set_value(warp_weight.doctype, warp_weight.name, "yarn_quality", val.material)
				frappe.model.set_value(warp_weight.doctype, warp_weight.name, "weaving_waste", val.weaving_waste)
				frappe.model.set_value(warp_weight.doctype, warp_weight.name, "yarn_input", val.input_yarn)
				if (val.yarn_type=="Direct") {
					count_in_ne = flt(val.yarn_conversion_value)/flt(val.final_count)
					frappe.model.set_value(warp_weight.doctype, warp_weight.name, "count_in_ne", count_in_ne)
				} else {
					count_in_ne = flt(val.yarn_conversion_value)*flt(val.final_count)
					frappe.model.set_value(warp_weight.doctype, warp_weight.name, "count_in_ne", count_in_ne)
				}

				var weight_ = ((epi*width)*(length/39.37)*5315/(9000*count_in_ne))*(val.percent_used/100)
				if (Number.isNaN(weight_)){
					frappe.model.set_value(warp_weight.doctype, warp_weight.name, "wtlmt_in_grams", 0.0)
				} else {
					frappe.model.set_value(warp_weight.doctype, warp_weight.name, "wtlmt_in_grams", flt(weight_))
				}
				frappe.model.set_value(warp_weight.doctype, warp_weight.name, "price", val.grey_yarn_price)
				total_warp_weight+=weight_
				var yarn_cost = 0.0
				var warp_yarn_cost = frappe.model.add_child(frm.doc, "WARP Yarn Cost", "warp_yarn_cost");
				var weight_with_waste=weight_*(1+val.weaving_waste/100)
				frappe.model.set_value(warp_yarn_cost.doctype, warp_yarn_cost.name, "weight_with_waste", weight_with_waste)
				frappe.model.set_value(warp_yarn_cost.doctype, warp_yarn_cost.name, "ratekg_grey", val.grey_yarn_price)
				frappe.model.set_value(warp_yarn_cost.doctype, warp_yarn_cost.name, "dyeing", val.dyeing_cost)
				yarn_cost = (weight_with_waste*(val.grey_yarn_price+val.dyeing_cost))/1000
				if (Number.isNaN(yarn_cost)){
					frappe.model.set_value(warp_yarn_cost.doctype, warp_yarn_cost.name, "yarn_cost", yarn_cost)
				} else {
					frappe.model.set_value(warp_yarn_cost.doctype, warp_yarn_cost.name, "yarn_cost", yarn_cost)
				}
				total_yarn_cost+=yarn_cost
			}
		})

		$.each(frm.doc.weft, function (idx, val) {
			var count_in_ne=0.0
			if (val.percent_used > 0){
				var weft_weight = frappe.model.add_child(frm.doc, "WEFT Weight", "weft_weight");
				frappe.model.set_value(weft_weight.doctype, weft_weight.name, "yarn_quality", val.material)
				frappe.model.set_value(weft_weight.doctype, weft_weight.name, "weaving_waste", val.weaving_waste)
				frappe.model.set_value(weft_weight.doctype, weft_weight.name, "yarn_input", val.input_yarn)
				if (val.yarn_type=="Direct") {
					count_in_ne = flt(val.yarn_conversion_value)/flt(val.final_count)
					frappe.model.set_value(weft_weight.doctype, weft_weight.name, "count_in_ne", count_in_ne)
				} else {
					count_in_ne = flt(val.yarn_conversion_value)*flt(val.final_count)
					frappe.model.set_value(weft_weight.doctype, weft_weight.name, "count_in_ne", count_in_ne)
				}

				var weight_ = ((ppi*width)*(length/39.37)*5315/(9000*count_in_ne))*(val.percent_used/100)
				if (Number.isNaN(weight_)){
					frappe.model.set_value(weft_weight.doctype, weft_weight.name, "wtlmt_in_grams", 0.0)
				} else {
					frappe.model.set_value(weft_weight.doctype, weft_weight.name, "wtlmt_in_grams", flt(weight_))
				}
				frappe.model.set_value(weft_weight.doctype, weft_weight.name, "price", val.grey_yarn_price)
				total_weft_weight+=weight_

				var yarn_cost = 0.0
				var weft_yarn_cost = frappe.model.add_child(frm.doc, "WEFT Yarn Cost", "weft_yarn_cost");
				var weight_with_waste=weight_*(1+val.weaving_waste/100) 
				frappe.model.set_value(weft_yarn_cost.doctype, weft_yarn_cost.name, "weight_with_waste", weight_with_waste)
				frappe.model.set_value(weft_yarn_cost.doctype, weft_yarn_cost.name, "ratekg_grey", val.grey_yarn_price)
				frappe.model.set_value(weft_yarn_cost.doctype, weft_yarn_cost.name, "dyeing", val.dyeing_cost)
				yarn_cost = (weight_with_waste*(val.grey_yarn_price+val.dyeing_cost))/1000
				if (Number.isNaN(yarn_cost)){
					frappe.model.set_value(weft_yarn_cost.doctype, weft_yarn_cost.name, "yarn_cost", 0.0)
				} else {
					frappe.model.set_value(weft_yarn_cost.doctype, weft_yarn_cost.name, "yarn_cost", yarn_cost)
				}
				total_yarn_cost+=yarn_cost
			}
		})
		var total_weight = 0.0
		var fabric_gsm = 0.0
		total_weight = total_weft_weight+total_warp_weight
		frm.set_value("total_weft_weight", total_weft_weight)
		frm.set_value("total_warp_weight", total_warp_weight)
		frm.set_value("total_warp_weft_weight", total_weight)
		fabric_gsm=((total_weight*39.37*39.37)/(f_width*f_length)*(1-frm.doc.dyeing_waste_+100))/100
		frm.set_value("fabric_gsm", fabric_gsm)
		frm.set_value("total_yarn_cost", total_yarn_cost)
		frm.refresh_fields()
	},

	grey_yarn_price: function(frm, cdt, cdn){
		var length = 0.0
		var width = 0.0
		var epi = 0.0
		var ppi = 0.0 
		var total_warp_weight = 0.0
		var total_weft_weight = 0.0
		var total_yarn_cost = 0.0
		frm.clear_table("warp_weight")
		frm.clear_table("weft_weight")
		frm.clear_table("warp_yarn_cost")
		frm.clear_table("weft_yarn_cost")
		var f_length = 0.0
		var f_width = 0.0
		$.each(frm.doc.machine_details, function (idx, val) {
			if (val.size_in=="Width (In Inches)"){
				width+=val.on_machine_size
				f_width+=val.finished_size
			} else {
				length+=val.on_machine_size
				f_length+=val.finished_size
			}
		})

		$.each(frm.doc.fabric, function (idx, val) {
			if (val.norms=="EPI"){
				epi+=val.on_loom
			} else if (val.norms=="PPI"){
				ppi+=val.on_loom
			}
		})

		$.each(frm.doc.warp, function (idx, val) {
			var count_in_ne = 0.0
			var weight_ = 0.0 
			var weight_with_waste = 0.0
			if (val.percent_used > 0){
				var warp_weight = frappe.model.add_child(frm.doc, "WARP Weight", "warp_weight");
				frappe.model.set_value(warp_weight.doctype, warp_weight.name, "yarn_quality", val.material)
				frappe.model.set_value(warp_weight.doctype, warp_weight.name, "weaving_waste", val.weaving_waste)
				frappe.model.set_value(warp_weight.doctype, warp_weight.name, "yarn_input", val.input_yarn)
				if (val.yarn_type=="Direct") {
					count_in_ne = flt(val.yarn_conversion_value)/flt(val.final_count)
					frappe.model.set_value(warp_weight.doctype, warp_weight.name, "count_in_ne", count_in_ne)
				} else {
					count_in_ne = flt(val.yarn_conversion_value)*flt(val.final_count)
					frappe.model.set_value(warp_weight.doctype, warp_weight.name, "count_in_ne", count_in_ne)
				}

				var weight_ = ((epi*width)*(length/39.37)*5315/(9000*count_in_ne))*(val.percent_used/100)
				if (Number.isNaN(weight_)){
					frappe.model.set_value(warp_weight.doctype, warp_weight.name, "wtlmt_in_grams", 0.0)
				} else {
					frappe.model.set_value(warp_weight.doctype, warp_weight.name, "wtlmt_in_grams", flt(weight_))
				}
				frappe.model.set_value(warp_weight.doctype, warp_weight.name, "price", val.grey_yarn_price)
				total_warp_weight+=weight_

				var yarn_cost = 0.0
				var warp_yarn_cost = frappe.model.add_child(frm.doc, "WARP Yarn Cost", "warp_yarn_cost");
				var weight_with_waste=weight_*(1+val.weaving_waste/100)
				frappe.model.set_value(warp_yarn_cost.doctype, warp_yarn_cost.name, "weight_with_waste", weight_with_waste)
				frappe.model.set_value(warp_yarn_cost.doctype, warp_yarn_cost.name, "ratekg_grey", val.grey_yarn_price)
				frappe.model.set_value(warp_yarn_cost.doctype, warp_yarn_cost.name, "dyeing", val.dyeing_cost)
				yarn_cost = (weight_with_waste*(val.grey_yarn_price+val.dyeing_cost))/1000
				if (Number.isNaN(yarn_cost)){
					frappe.model.set_value(warp_yarn_cost.doctype, warp_yarn_cost.name, "yarn_cost", yarn_cost)
				} else {
					frappe.model.set_value(warp_yarn_cost.doctype, warp_yarn_cost.name, "yarn_cost", yarn_cost)
				}

				total_yarn_cost+=yarn_cost
			}
		})

		$.each(frm.doc.weft, function (idx, val) {
			var count_in_ne=0.0
			if (val.percent_used > 0){
				var weft_weight = frappe.model.add_child(frm.doc, "WEFT Weight", "weft_weight");
				frappe.model.set_value(weft_weight.doctype, weft_weight.name, "yarn_quality", val.material)
				frappe.model.set_value(weft_weight.doctype, weft_weight.name, "weaving_waste", val.weaving_waste)
				frappe.model.set_value(weft_weight.doctype, weft_weight.name, "yarn_input", val.input_yarn)
				if (val.yarn_type=="Direct") {
					count_in_ne = flt(val.yarn_conversion_value)/flt(val.final_count)
					frappe.model.set_value(weft_weight.doctype, weft_weight.name, "count_in_ne", count_in_ne)
				} else {
					count_in_ne = flt(val.yarn_conversion_value)*flt(val.final_count)
					frappe.model.set_value(weft_weight.doctype, weft_weight.name, "count_in_ne", count_in_ne)
				}

				var weight_ = ((ppi*width)*(length/39.37)*5315/(9000*count_in_ne))*(val.percent_used/100)
				if (Number.isNaN(weight_)){
					frappe.model.set_value(weft_weight.doctype, weft_weight.name, "wtlmt_in_grams", 0.0)
				} else {
					frappe.model.set_value(weft_weight.doctype, weft_weight.name, "wtlmt_in_grams", flt(weight_))
				}
				frappe.model.set_value(weft_weight.doctype, weft_weight.name, "price", val.grey_yarn_price)
				total_weft_weight+=weight_

				var yarn_cost = 0.0
				var weft_yarn_cost = frappe.model.add_child(frm.doc, "WEFT Yarn Cost", "weft_yarn_cost");
				var weight_with_waste=weight_*(1+val.weaving_waste/100)
				frappe.model.set_value(weft_yarn_cost.doctype, weft_yarn_cost.name, "weight_with_waste", weight_with_waste)
				frappe.model.set_value(weft_yarn_cost.doctype, weft_yarn_cost.name, "ratekg_grey", val.grey_yarn_price)
				frappe.model.set_value(weft_yarn_cost.doctype, weft_yarn_cost.name, "dyeing", val.dyeing_cost)
				yarn_cost = (weight_with_waste*(val.grey_yarn_price+val.dyeing_cost))/1000
				if (Number.isNaN(yarn_cost)){
					frappe.model.set_value(weft_yarn_cost.doctype, weft_yarn_cost.name, "yarn_cost", 0.0)
				} else {
					frappe.model.set_value(weft_yarn_cost.doctype, weft_yarn_cost.name, "yarn_cost", yarn_cost)
				}
				total_yarn_cost+=yarn_cost
			}
		})
		var total_weight = 0.0
		var fabric_gsm = 0.0
		total_weight = total_weft_weight+total_warp_weight
		frm.set_value("total_weft_weight", total_weft_weight)
		frm.set_value("total_warp_weight", total_warp_weight)
		frm.set_value("total_warp_weft_weight", total_weight)
		fabric_gsm=((total_weight*39.37*39.37)/(f_width*f_length)*(1-frm.doc.dyeing_waste_+100))/100
		frm.set_value("fabric_gsm", fabric_gsm)
		frm.set_value("total_yarn_cost", total_yarn_cost)
		frm.refresh_fields()
	},

	dyeing_cost: function(frm, cdt, cdn) {
		var length = 0.0
		var width = 0.0
		var epi = 0.0
		var ppi = 0.0
		var total_warp_weight = 0.0
		var total_weft_weight = 0.0
		var total_yarn_cost = 0.0
		frm.clear_table("warp_weight")
		frm.clear_table("weft_weight")
		frm.clear_table("warp_yarn_cost")
		frm.clear_table("weft_yarn_cost")
		var f_length = 0.0
		var f_width = 0.0
		$.each(frm.doc.machine_details, function (idx, val) {
			if (val.size_in=="Width (In Inches)"){
				width+=val.on_machine_size
				f_width+=val.finished_size
			} else {
				length+=val.on_machine_size
				f_length+=val.finished_size
			}
		})

		$.each(frm.doc.fabric, function (idx, val) {
			if (val.norms=="EPI"){
				epi+=val.on_loom
			} else if (val.norms=="PPI"){
				ppi+=val.on_loom
			}
		})

		$.each(frm.doc.warp, function (idx, val) {
			var count_in_ne = 0.0
			var weight_ = 0.0 
			var weight_with_waste = 0.0
			if (val.percent_used > 0){
				var warp_weight = frappe.model.add_child(frm.doc, "WARP Weight", "warp_weight");
				frappe.model.set_value(warp_weight.doctype, warp_weight.name, "yarn_quality", val.material)
				frappe.model.set_value(warp_weight.doctype, warp_weight.name, "weaving_waste", val.weaving_waste)
				frappe.model.set_value(warp_weight.doctype, warp_weight.name, "yarn_input", val.input_yarn)
				if (val.yarn_type=="Direct") {
					count_in_ne = flt(val.yarn_conversion_value)/flt(val.final_count)
					frappe.model.set_value(warp_weight.doctype, warp_weight.name, "count_in_ne", count_in_ne)
				} else {
					count_in_ne = flt(val.yarn_conversion_value)*flt(val.final_count)
					frappe.model.set_value(warp_weight.doctype, warp_weight.name, "count_in_ne", count_in_ne)
				}

				var weight_ = ((epi*width)*(length/39.37)*5315/(9000*count_in_ne))*(val.percent_used/100)
				if (Number.isNaN(weight_)){
					frappe.model.set_value(warp_weight.doctype, warp_weight.name, "wtlmt_in_grams", 0.0)
				} else {
					frappe.model.set_value(warp_weight.doctype, warp_weight.name, "wtlmt_in_grams", flt(weight_))
				}
				frappe.model.set_value(warp_weight.doctype, warp_weight.name, "price", val.grey_yarn_price)
				total_warp_weight+=weight_

				var yarn_cost = 0.0
				var warp_yarn_cost = frappe.model.add_child(frm.doc, "WARP Yarn Cost", "warp_yarn_cost");
				var weight_with_waste=weight_*(1+val.weaving_waste/100)
				frappe.model.set_value(warp_yarn_cost.doctype, warp_yarn_cost.name, "weight_with_waste", weight_with_waste)
				frappe.model.set_value(warp_yarn_cost.doctype, warp_yarn_cost.name, "ratekg_grey", val.grey_yarn_price)
				frappe.model.set_value(warp_yarn_cost.doctype, warp_yarn_cost.name, "dyeing", val.dyeing_cost)
				yarn_cost = (weight_with_waste*(val.grey_yarn_price+val.dyeing_cost))/1000
				if (Number.isNaN(yarn_cost)){
					frappe.model.set_value(warp_yarn_cost.doctype, warp_yarn_cost.name, "yarn_cost", yarn_cost)
				} else {
					frappe.model.set_value(warp_yarn_cost.doctype, warp_yarn_cost.name, "yarn_cost", yarn_cost)
				}

				total_yarn_cost+=yarn_cost
			}
		})

		$.each(frm.doc.weft, function (idx, val) {
			var count_in_ne=0.0
			if (val.percent_used > 0){
				var weft_weight = frappe.model.add_child(frm.doc, "WEFT Weight", "weft_weight");
				frappe.model.set_value(weft_weight.doctype, weft_weight.name, "yarn_quality", val.material)
				frappe.model.set_value(weft_weight.doctype, weft_weight.name, "weaving_waste", val.weaving_waste)
				frappe.model.set_value(weft_weight.doctype, weft_weight.name, "yarn_input", val.input_yarn)
				if (val.yarn_type=="Direct") {
					count_in_ne = flt(val.yarn_conversion_value)/flt(val.final_count)
					frappe.model.set_value(weft_weight.doctype, weft_weight.name, "count_in_ne", count_in_ne)
				} else {
					count_in_ne = flt(val.yarn_conversion_value)*flt(val.final_count)
					frappe.model.set_value(weft_weight.doctype, weft_weight.name, "count_in_ne", count_in_ne)
				}

				var weight_ = ((ppi*width)*(length/39.37)*5315/(9000*count_in_ne))*(val.percent_used/100)
				if (Number.isNaN(weight_)){
					frappe.model.set_value(weft_weight.doctype, weft_weight.name, "wtlmt_in_grams", 0.0)
				} else {
					frappe.model.set_value(weft_weight.doctype, weft_weight.name, "wtlmt_in_grams", flt(weight_))
				}
				frappe.model.set_value(weft_weight.doctype, weft_weight.name, "price", val.grey_yarn_price)
				total_weft_weight+=weight_

				var yarn_cost = 0.0
				var weft_yarn_cost = frappe.model.add_child(frm.doc, "WEFT Yarn Cost", "weft_yarn_cost");
				var weight_with_waste=weight_*(1+val.weaving_waste/100)
				frappe.model.set_value(weft_yarn_cost.doctype, weft_yarn_cost.name, "weight_with_waste", weight_with_waste)
				frappe.model.set_value(weft_yarn_cost.doctype, weft_yarn_cost.name, "ratekg_grey", val.grey_yarn_price)
				frappe.model.set_value(weft_yarn_cost.doctype, weft_yarn_cost.name, "dyeing", val.dyeing_cost)
				yarn_cost = (weight_with_waste*(val.grey_yarn_price+val.dyeing_cost))/1000
				if (Number.isNaN(yarn_cost)){
					frappe.model.set_value(weft_yarn_cost.doctype, weft_yarn_cost.name, "yarn_cost", 0.0)
				} else {
					frappe.model.set_value(weft_yarn_cost.doctype, weft_yarn_cost.name, "yarn_cost", yarn_cost)
				}
				total_yarn_cost+=yarn_cost
			}
		})
		var total_weight = 0.0
		var fabric_gsm = 0.0
		total_weight = total_weft_weight+total_warp_weight
		frm.set_value("total_weft_weight", total_weft_weight)
		frm.set_value("total_warp_weight", total_warp_weight)
		frm.set_value("total_warp_weft_weight", total_weight)
		fabric_gsm=((total_weight*39.37*39.37)/(f_width*f_length)*(1-frm.doc.dyeing_waste_+100))/100
		frm.set_value("fabric_gsm", fabric_gsm)
		frm.set_value("total_yarn_cost", total_yarn_cost)
		frm.refresh_fields()
	},

	yarn_count_input: function(frm, cdt, cdn) {
		var row = locals[cdt][cdn]
		var length = 0.0
		var width = 0.0
		var epi = 0.0
		var ppi = 0.0
		var total_warp_weight = 0.0
		var total_weft_weight = 0.0
		var total_yarn_cost = 0.0
		var final_count = 0.0
		if (row.yarn_type=="Direct"){
			final_count = flt(row.yarn_count_input)*flt(row.number_of_ply)
			frappe.model.set_value(row.doctype, row.name, "final_count", final_count)
		} else {
			final_count = flt(row.yarn_count_input)/flt(row.number_of_ply)
			frappe.model.set_value(row.doctype, row.name, "final_count", final_count)	
		}

		var total_warp = 0.0
		var total_weft = 0.0
		frm.clear_table("yarn_details_for_warp")
		frm.clear_table("yarn_details_for_weft")
		$.each(frm.doc.warp, function (idx, val) {
			if (val.percent_used > 0){
				var d = frappe.model.add_child(frm.doc, "Yarn Details for WARP", "yarn_details_for_warp");
				frappe.model.set_value(d.doctype, d.name, "input_yarn_quality", val.material)
				frappe.model.set_value(d.doctype, d.name, "_used", val.percent_used)
				frappe.model.set_value(d.doctype, d.name, "yarn_count", val.yarn_count)
				frappe.model.set_value(d.doctype, d.name, "yarn_count_input", val.final_count)
				total_warp+=val.percent_used
			}
		})

		$.each(frm.doc.weft, function (idx, val) {
			if (val.percent_used > 0){
				var d = frappe.model.add_child(frm.doc, "Yarn Details for WEFT", "yarn_details_for_weft");
				frappe.model.set_value(d.doctype, d.name, "input_yarn_quality", val.material)
				frappe.model.set_value(d.doctype, d.name, "_used", val.percent_used)
				frappe.model.set_value(d.doctype, d.name, "yarn_count", val.yarn_count)
				frappe.model.set_value(d.doctype, d.name, "yarn_count_input", val.final_count)
				total_weft+=val.percent_used
			}
		})
		frm.set_value("total_warp", total_warp)
		frm.set_value("total_weft", total_weft)
		frm.refresh_fields();

		frm.clear_table("warp_weight")
		frm.clear_table("weft_weight")
		frm.clear_table("warp_yarn_cost")
		frm.clear_table("weft_yarn_cost")
		var f_length = 0.0
		var f_width = 0.0
		$.each(frm.doc.machine_details, function (idx, val) {
			if (val.size_in=="Width (In Inches)"){
				width+=val.on_machine_size
				f_width+=val.finished_size
			} else {
				length+=val.on_machine_size
				f_length+=val.finished_size
			}
		})

		$.each(frm.doc.fabric, function (idx, val) {
			if (val.norms=="EPI"){
				epi+=val.on_loom
			} else if (val.norms=="PPI"){
				ppi+=val.on_loom
			}
		})

		$.each(frm.doc.warp, function (idx, val) {
			var count_in_ne = 0.0
			var weight_ = 0.0 
			var weight_with_waste = 0.0
			if (val.percent_used > 0){
				var warp_weight = frappe.model.add_child(frm.doc, "WARP Weight", "warp_weight");
				frappe.model.set_value(warp_weight.doctype, warp_weight.name, "yarn_quality", val.material)
				frappe.model.set_value(warp_weight.doctype, warp_weight.name, "weaving_waste", val.weaving_waste)
				frappe.model.set_value(warp_weight.doctype, warp_weight.name, "yarn_input", val.input_yarn)
				if (val.yarn_type=="Direct") {
					count_in_ne = flt(val.yarn_conversion_value)/flt(val.final_count)
					frappe.model.set_value(warp_weight.doctype, warp_weight.name, "count_in_ne", count_in_ne)
				} else {
					count_in_ne = flt(val.yarn_conversion_value)*flt(val.final_count)
					frappe.model.set_value(warp_weight.doctype, warp_weight.name, "count_in_ne", count_in_ne)
				}

				var weight_ = ((epi*width)*(length/39.37)*5315/(9000*count_in_ne))*(val.percent_used/100)
				if (Number.isNaN(weight_)){
					frappe.model.set_value(warp_weight.doctype, warp_weight.name, "wtlmt_in_grams", 0.0)
				} else {
					frappe.model.set_value(warp_weight.doctype, warp_weight.name, "wtlmt_in_grams", flt(weight_))
				}
				frappe.model.set_value(warp_weight.doctype, warp_weight.name, "price", val.grey_yarn_price)
				total_warp_weight+=weight_

				var yarn_cost = 0.0
				var warp_yarn_cost = frappe.model.add_child(frm.doc, "WARP Yarn Cost", "warp_yarn_cost");
				var weight_with_waste=weight_*(1+val.weaving_waste/100)
				frappe.model.set_value(warp_yarn_cost.doctype, warp_yarn_cost.name, "weight_with_waste", weight_with_waste)
				frappe.model.set_value(warp_yarn_cost.doctype, warp_yarn_cost.name, "ratekg_grey", val.grey_yarn_price)
				frappe.model.set_value(warp_yarn_cost.doctype, warp_yarn_cost.name, "dyeing", val.dyeing_cost)
				yarn_cost = (weight_with_waste*(val.grey_yarn_price+val.dyeing_cost))/1000
				if (Number.isNaN(yarn_cost)){
					frappe.model.set_value(warp_yarn_cost.doctype, warp_yarn_cost.name, "yarn_cost", yarn_cost)
				} else {
					frappe.model.set_value(warp_yarn_cost.doctype, warp_yarn_cost.name, "yarn_cost", yarn_cost)
				}

				total_yarn_cost+=yarn_cost
			}
		})

		$.each(frm.doc.weft, function (idx, val) {
			var count_in_ne=0.0
			if (val.percent_used > 0){
				var weft_weight = frappe.model.add_child(frm.doc, "WEFT Weight", "weft_weight");
				frappe.model.set_value(weft_weight.doctype, weft_weight.name, "yarn_quality", val.material)
				frappe.model.set_value(weft_weight.doctype, weft_weight.name, "weaving_waste", val.weaving_waste)
				frappe.model.set_value(weft_weight.doctype, weft_weight.name, "yarn_input", val.input_yarn)
				if (val.yarn_type=="Direct") {
					count_in_ne = flt(val.yarn_conversion_value)/flt(val.final_count)
					frappe.model.set_value(weft_weight.doctype, weft_weight.name, "count_in_ne", count_in_ne)
				} else {
					count_in_ne = flt(val.yarn_conversion_value)*flt(val.final_count)
					frappe.model.set_value(weft_weight.doctype, weft_weight.name, "count_in_ne", count_in_ne)
				}

				var weight_ = ((ppi*width)*(length/39.37)*5315/(9000*count_in_ne))*(val.percent_used/100)
				if (Number.isNaN(weight_)){
					frappe.model.set_value(weft_weight.doctype, weft_weight.name, "wtlmt_in_grams", 0.0)
				} else {
					frappe.model.set_value(weft_weight.doctype, weft_weight.name, "wtlmt_in_grams", flt(weight_))
				}
				frappe.model.set_value(weft_weight.doctype, weft_weight.name, "price", val.grey_yarn_price)
				total_weft_weight+=weight_

				var yarn_cost = 0.0
				var weft_yarn_cost = frappe.model.add_child(frm.doc, "WEFT Yarn Cost", "weft_yarn_cost");
				var weight_with_waste=weight_*(1+val.weaving_waste/100)
				frappe.model.set_value(weft_yarn_cost.doctype, weft_yarn_cost.name, "weight_with_waste", weight_with_waste)
				frappe.model.set_value(weft_yarn_cost.doctype, weft_yarn_cost.name, "ratekg_grey", val.grey_yarn_price)
				frappe.model.set_value(weft_yarn_cost.doctype, weft_yarn_cost.name, "dyeing", val.dyeing_cost)
				yarn_cost = (weight_with_waste*(val.grey_yarn_price+val.dyeing_cost))/1000
				if (Number.isNaN(yarn_cost)){
					frappe.model.set_value(weft_yarn_cost.doctype, weft_yarn_cost.name, "yarn_cost", 0.0)
				} else {
					frappe.model.set_value(weft_yarn_cost.doctype, weft_yarn_cost.name, "yarn_cost", yarn_cost)
				}
				total_yarn_cost+=yarn_cost
			}
		})
		var total_weight = 0.0
		var fabric_gsm = 0.0
		total_weight = total_weft_weight+total_warp_weight
		frm.set_value("total_weft_weight", total_weft_weight)
		frm.set_value("total_warp_weight", total_warp_weight)
		frm.set_value("total_warp_weft_weight", total_weight)
		fabric_gsm=((total_weight*39.37*39.37)/(f_width*f_length)*(1-frm.doc.dyeing_waste_+100))/100
		frm.set_value("fabric_gsm", fabric_gsm)
		frm.set_value("total_yarn_cost", total_yarn_cost)
		frm.refresh_fields()
	}

});

frappe.ui.form.on('Fabric Details', {
	on_loom: function(frm, cdt, cdn){
		var row = locals[cdt][cdn]
		if(row.norms=="Width (In Inches)"){
			frm.set_value("machine_size", row.on_loom)
			frm.set_value("machine_size_", row.on_loom)

			if (frm.doc.weaving_costs[0]){
				$.each(frm.doc.weaving_costs, function (idx, val) {
					if (val.idx==1){
						frappe.model.set_value(val.doctype, val.name, "machine_width", row.on_loom)	
					}
				})
			} else {
				var weaving_costs = frappe.model.add_child(frm.doc, "Weaving Costs", "weaving_costs");
				frappe.model.set_value(weaving_costs.doctype, weaving_costs.name, "machine_width", row.on_loom)
			}
		}

		$.each(frm.doc.machine_details, function (idx, val) {
			if (row.norms==val.size_in){
				frappe.model.set_value(val.doctype, val.name, 'on_machine_size', row.on_loom)
			}
		})

		$.each(frm.doc.machine_detail, function (idx, val) {
			if ((row.norms=="EPI") && (val.crimp_=="Warp")){
				frappe.model.set_value(val.doctype, val.name, 'on_machine', flt(row.on_loom))
			} else if ((row.norms=="PPI") && (val.crimp_=="Weft")){
				frappe.model.set_value(val.doctype, val.name, 'on_machine', flt(row.on_loom))
			}
		})

		var length = 0.0
		var width = 0.0
		var epi = 0.0
		var total_warp_weight = 0.0
		var total_weft_weight = 0.0
		var total_yarn_cost = 0.0
		var f_length = 0.0
		var f_width = 0.0
		$.each(frm.doc.machine_details, function (idx, val) {
			if (val.size_in=="Width (In Inches)"){
				width+=val.on_machine_size
				f_width+=val.finished_size
			} else {
				length+=val.on_machine_size
				f_length+=val.finished_size
			}
		})

		if (row.norms=="EPI"){
			frm.clear_table("warp_weight")
			frm.clear_table("warp_yarn_cost")
			$.each(frm.doc.warp, function (idx, val) {
				var count_in_ne = 0.0
				var weight_ = 0.0 
				var weight_with_waste = 0.0
				if (val.percent_used > 0){
					var warp_weight = frappe.model.add_child(frm.doc, "WARP Weight", "warp_weight");
					frappe.model.set_value(warp_weight.doctype, warp_weight.name, "yarn_quality", val.material)
					frappe.model.set_value(warp_weight.doctype, warp_weight.name, "weaving_waste", val.weaving_waste)
					frappe.model.set_value(warp_weight.doctype, warp_weight.name, "yarn_input", val.input_yarn)
					if (val.yarn_type=="Direct") {
						count_in_ne = flt(val.yarn_conversion_value)/flt(val.final_count)
						frappe.model.set_value(warp_weight.doctype, warp_weight.name, "count_in_ne", count_in_ne)
					} else {
						count_in_ne = flt(val.yarn_conversion_value)*flt(val.final_count)
						frappe.model.set_value(warp_weight.doctype, warp_weight.name, "count_in_ne", count_in_ne)
					}
					var weight_ = ((row.on_loom*width)*(length/39.37)*5315/(9000*count_in_ne))*(val.percent_used/100)
					if (Number.isNaN(weight_)){
						frappe.model.set_value(warp_weight.doctype, warp_weight.name, "wtlmt_in_grams", 0.0)
					} else {
						frappe.model.set_value(warp_weight.doctype, warp_weight.name, "wtlmt_in_grams", flt(weight_))
					}
					frappe.model.set_value(warp_weight.doctype, warp_weight.name, "price", val.grey_yarn_price)
					total_warp_weight+=weight_

					var yarn_cost = 0.0
					var warp_yarn_cost = frappe.model.add_child(frm.doc, "WARP Yarn Cost", "warp_yarn_cost");
					var weight_with_waste=weight_*(1+val.weaving_waste/100)
					frappe.model.set_value(warp_yarn_cost.doctype, warp_yarn_cost.name, "weight_with_waste", weight_with_waste)
					frappe.model.set_value(warp_yarn_cost.doctype, warp_yarn_cost.name, "ratekg_grey", val.grey_yarn_price)
					frappe.model.set_value(warp_yarn_cost.doctype, warp_yarn_cost.name, "dyeing", val.dyeing_cost)

					yarn_cost = (weight_with_waste*(val.grey_yarn_price+val.dyeing_cost))/1000
					if (Number.isNaN(yarn_cost)){
						frappe.model.set_value(warp_yarn_cost.doctype, warp_yarn_cost.name, "yarn_cost", yarn_cost)
					} else {
						frappe.model.set_value(warp_yarn_cost.doctype, warp_yarn_cost.name, "yarn_cost", yarn_cost)
					}

					total_yarn_cost+=yarn_cost
				}
			})
		} else if (row.norms=="PPI"){
			frm.clear_table("weft_weight")
			frm.clear_table("weft_yarn_cost")
			$.each(frm.doc.weft, function (idx, val) {
				var count_in_ne=0.0
				if (val.percent_used > 0){
					var weft_weight = frappe.model.add_child(frm.doc, "WEFT Weight", "weft_weight");
					frappe.model.set_value(weft_weight.doctype, weft_weight.name, "yarn_quality", val.material)
					frappe.model.set_value(weft_weight.doctype, weft_weight.name, "weaving_waste", val.weaving_waste)
					frappe.model.set_value(weft_weight.doctype, weft_weight.name, "yarn_input", val.input_yarn)
					if (val.yarn_type=="Direct") {
						count_in_ne = flt(val.yarn_conversion_value)/flt(val.final_count)
						frappe.model.set_value(weft_weight.doctype, weft_weight.name, "count_in_ne", count_in_ne)
					} else {
						count_in_ne = flt(val.yarn_conversion_value)*flt(val.final_count)
						frappe.model.set_value(weft_weight.doctype, weft_weight.name, "count_in_ne", count_in_ne)
					}

					var weight_ = ((row.on_loom*width)*(length/39.37)*5315/(9000*count_in_ne))*(val.percent_used/100)
					if (Number.isNaN(weight_)){
						frappe.model.set_value(weft_weight.doctype, weft_weight.name, "wtlmt_in_grams", 0.0)
					} else {
						frappe.model.set_value(weft_weight.doctype, weft_weight.name, "wtlmt_in_grams", flt(weight_))
					}
					frappe.model.set_value(weft_weight.doctype, weft_weight.name, "price", val.grey_yarn_price)
					total_weft_weight+=weight_

					var yarn_cost = 0.0
					var weft_yarn_cost = frappe.model.add_child(frm.doc, "WEFT Yarn Cost", "weft_yarn_cost");
					var weight_with_waste=weight_*(1+val.weaving_waste/100)
					frappe.model.set_value(weft_yarn_cost.doctype, weft_yarn_cost.name, "weight_with_waste", weight_with_waste)
					frappe.model.set_value(weft_yarn_cost.doctype, weft_yarn_cost.name, "ratekg_grey", val.grey_yarn_price)
					frappe.model.set_value(weft_yarn_cost.doctype, weft_yarn_cost.name, "dyeing", val.dyeing_cost)
					yarn_cost = (weight_with_waste*(val.grey_yarn_price+val.dyeing_cost))/1000
					if (Number.isNaN(yarn_cost)){
						frappe.model.set_value(weft_yarn_cost.doctype, weft_yarn_cost.name, "yarn_cost", 0.0)
					} else {
						frappe.model.set_value(weft_yarn_cost.doctype, weft_yarn_cost.name, "yarn_cost", yarn_cost)
					}
					total_yarn_cost+=yarn_cost
				}
			})
		}
		var total_weight = 0.0
		var fabric_gsm = 0.0
		total_weight = total_weft_weight+total_warp_weight
		frm.set_value("total_weft_weight", total_weft_weight)
		frm.set_value("total_warp_weight", total_warp_weight)
		frm.set_value("total_warp_weft_weight", total_weight)
		fabric_gsm=((total_weight*39.37*39.37)/(f_width*f_length)*(1-frm.doc.dyeing_waste_+100))/100
		frm.set_value("fabric_gsm", fabric_gsm)
		frm.set_value("total_yarn_cost", total_yarn_cost)
		frm.refresh_fields()
	},

	on_table: function(frm, cdt, cdn){
		var row = locals[cdt][cdn]
		$.each(frm.doc.machine_details, function (idx, val) {
			if (row.norms==val.size_in){
				frappe.model.set_value(val.doctype, val.name, 'on_table_size', row.on_table)
			}
		})
		frm.refresh_field("machine_details")
	},
	finished: function(frm, cdt, cdn){
		var row = locals[cdt][cdn]
		$.each(frm.doc.machine_details, function (idx, val) {
			if (row.norms==val.size_in){
				frappe.model.set_value(val.doctype, val.name, 'finished_size', row.finished)
			}
		})
		if(row.norms=="Width (In Inches)"){
			if (frm.doc.width_cost_per_linear_metre[0]){
				$.each(frm.doc.width_cost_per_linear_metre, function (idx, val) {
					if (val.idx==1){
						frappe.model.set_value(val.doctype, val.name, "width", row.finished)
						frappe.model.set_value(val.doctype, val.name, "gsm", frm.doc.fabric_gsm)
					}
				})
			} else {
				var d = frappe.model.add_child(frm.doc, "Width Cost per Linear Metre", "width_cost_per_linear_metre");
				frappe.model.set_value(d.doctype, d.name, "width", row.finished)
				frappe.model.set_value(d.doctype, d.name, "gsm", frm.doc.fabric_gsm)
			}
		}
		frm.refresh_fields()
	}
});

frappe.ui.form.on('Machine Details', {
	on_machine_size: function(frm, cdt, cdn){
		var row = locals[cdt][cdn]
		var crimp_per = 0.0
		var crimp_cal = 0.0
		$.each(frm.doc.machine_detail, function (idx, val) {
			if((val.crimp_=="Warp") && (row.size_in=="Width (In Inches)")){
				var crimp_per = (flt(row.on_machine_size)-flt(row.finished_size))/row.finished_size*100
				crimp_per = parseFloat(crimp_per.toFixed(2))
				crimp_cal = (flt(val.on_machine)*(100+flt(crimp_per)))/100
				crimp_cal=parseFloat(crimp_cal.toFixed(2))
				frappe.model.set_value(val.doctype, val.name, 'crimp', crimp_per)
				frappe.model.set_value(val.doctype, val.name, 'with_crimp', crimp_cal)
			} else if ((val.crimp_=="Weft") && (row.size_in=="Length (In Inches)")){
				if (row.finished_size) {
					var crimp_per = (flt(row.on_machine_size)-flt(row.finished_size))/row.finished_size*100
					crimp_per = parseFloat(crimp_per.toFixed(2))
					crimp_cal = (flt(val.on_machine)*(100+flt(crimp_per)))/100
					crimp_cal=parseFloat(crimp_cal.toFixed(2))
					frappe.model.set_value(val.doctype, val.name, 'crimp', crimp_per)
					frappe.model.set_value(val.doctype, val.name, 'with_crimp', crimp_cal)
				}
			}
		})

		$.each(frm.doc.fabric, function (idx, val) {
			if (val.norms==row.size_in){
				frappe.model.set_value(val.doctype, val.name, 'on_loom', row.on_machine_size)
			}
		})


		var length_ = 0.0
		var width_ = 0.0
		var epi = 0.0
		var ppi = 0.0
		var total_warp_weight = 0.0
		var total_weft_weight = 0.0
		var total_yarn_cost = 0.0
		frm.clear_table("warp_weight")
		frm.clear_table("weft_weight")
		frm.clear_table("warp_yarn_cost")
		frm.clear_table("weft_yarn_cost")
		var f_length = 0.0
		var f_width = 0.0
		$.each(frm.doc.machine_details, function (idx, val) {
			if (val.size_in=="Width (In Inches)"){
				width_+=val.on_machine_size
				f_width+=val.finished_size
			} else {
				length_+=val.on_machine_size
				f_length+=val.finished_size
			}
		})

		$.each(frm.doc.fabric, function (idx, val) {
			if (val.norms=="EPI"){
				epi+=val.on_loom
			} else if (val.norms=="PPI"){
				ppi+=val.on_loom
			}
		})

		$.each(frm.doc.warp, function (idx, val) {
			var count_in_ne = 0.0
			var weight_ = 0.0 
			var weight_with_waste = 0.0
			if (val.percent_used > 0){
				var warp_weight = frappe.model.add_child(frm.doc, "WARP Weight", "warp_weight");
				frappe.model.set_value(warp_weight.doctype, warp_weight.name, "yarn_quality", val.material)
				frappe.model.set_value(warp_weight.doctype, warp_weight.name, "weaving_waste", val.weaving_waste)
				frappe.model.set_value(warp_weight.doctype, warp_weight.name, "yarn_input", val.input_yarn)
				if (val.yarn_type=="Direct") {
					count_in_ne = flt(val.yarn_conversion_value)/flt(val.final_count)
					frappe.model.set_value(warp_weight.doctype, warp_weight.name, "count_in_ne", count_in_ne)
				} else {
					count_in_ne = flt(val.yarn_conversion_value)*flt(val.final_count)
					frappe.model.set_value(warp_weight.doctype, warp_weight.name, "count_in_ne", count_in_ne)
				}

				var weight_ = ((epi*width_)*(length_/39.37)*5315/(9000*count_in_ne))*(val.percent_used/100)
				if (Number.isNaN(weight_)){
					frappe.model.set_value(warp_weight.doctype, warp_weight.name, "wtlmt_in_grams", 0.0)
				} else {
					frappe.model.set_value(warp_weight.doctype, warp_weight.name, "wtlmt_in_grams", flt(weight_))
				}
				frappe.model.set_value(warp_weight.doctype, warp_weight.name, "price", val.grey_yarn_price)
				total_warp_weight+=weight_

				var yarn_cost = 0.0
				var warp_yarn_cost = frappe.model.add_child(frm.doc, "WARP Yarn Cost", "warp_yarn_cost");
				var weight_with_waste=weight_*(1+val.weaving_waste/100)
				frappe.model.set_value(warp_yarn_cost.doctype, warp_yarn_cost.name, "weight_with_waste", weight_with_waste)
				frappe.model.set_value(warp_yarn_cost.doctype, warp_yarn_cost.name, "ratekg_grey", val.grey_yarn_price)
				frappe.model.set_value(warp_yarn_cost.doctype, warp_yarn_cost.name, "dyeing", val.dyeing_cost)
				yarn_cost = (weight_with_waste*(val.grey_yarn_price+val.dyeing_cost))/1000
				if (Number.isNaN(yarn_cost)){
					frappe.model.set_value(warp_yarn_cost.doctype, warp_yarn_cost.name, "yarn_cost", 0.0)
				} else {
					frappe.model.set_value(warp_yarn_cost.doctype, warp_yarn_cost.name, "yarn_cost", yarn_cost)
				}
				total_yarn_cost+=yarn_cost
			}
		})

		$.each(frm.doc.weft, function (idx, val) {
			var count_in_ne=0.0
			if (val.percent_used > 0){
				var weft_weight = frappe.model.add_child(frm.doc, "WEFT Weight", "weft_weight");
				frappe.model.set_value(weft_weight.doctype, weft_weight.name, "yarn_quality", val.material)
				frappe.model.set_value(weft_weight.doctype, weft_weight.name, "weaving_waste", val.weaving_waste)
				frappe.model.set_value(weft_weight.doctype, weft_weight.name, "yarn_input", val.input_yarn)
				if (val.yarn_type=="Direct") {
					count_in_ne = flt(val.yarn_conversion_value)/flt(val.final_count)
					frappe.model.set_value(weft_weight.doctype, weft_weight.name, "count_in_ne", count_in_ne)
				} else {
					count_in_ne = flt(val.yarn_conversion_value)*flt(val.final_count)
					frappe.model.set_value(weft_weight.doctype, weft_weight.name, "count_in_ne", count_in_ne)
				}

				var weight_ = ((ppi*width_)*(length_/39.37)*5315/(9000*count_in_ne))*(val.percent_used/100)
				if (Number.isNaN(weight_)){
					frappe.model.set_value(weft_weight.doctype, weft_weight.name, "wtlmt_in_grams", 0.0)
				} else {
					frappe.model.set_value(weft_weight.doctype, weft_weight.name, "wtlmt_in_grams", flt(weight_))
				}
				frappe.model.set_value(weft_weight.doctype, weft_weight.name, "price", val.grey_yarn_price)
				total_weft_weight+=weight_

				var yarn_cost = 0.0
				var weft_yarn_cost = frappe.model.add_child(frm.doc, "WEFT Yarn Cost", "weft_yarn_cost");
				var weight_with_waste=weight_*(1+val.weaving_waste/100)
				frappe.model.set_value(weft_yarn_cost.doctype, weft_yarn_cost.name, "weight_with_waste", weight_with_waste)
				frappe.model.set_value(weft_yarn_cost.doctype, weft_yarn_cost.name, "ratekg_grey", val.grey_yarn_price)
				frappe.model.set_value(weft_yarn_cost.doctype, weft_yarn_cost.name, "dyeing", val.dyeing_cost)
				yarn_cost = (weight_with_waste*(val.grey_yarn_price+val.dyeing_cost))/1000

				if (Number.isNaN(yarn_cost)){
					frappe.model.set_value(weft_yarn_cost.doctype, weft_yarn_cost.name, "yarn_cost", 0.0)
				} else {
					frappe.model.set_value(weft_yarn_cost.doctype, weft_yarn_cost.name, "yarn_cost", yarn_cost)
				}
				total_yarn_cost+=yarn_cost
			}
		})
		var total_weight = 0.0
		var fabric_gsm = 0.0
		total_weight = total_weft_weight+total_warp_weight
		frm.set_value("total_weft_weight", total_weft_weight)
		frm.set_value("total_warp_weight", total_warp_weight)
		frm.set_value("total_warp_weft_weight", total_weight)
		fabric_gsm=((total_weight*39.37*39.37)/(f_width*f_length)*(1-frm.doc.dyeing_waste_+100))/100
		frm.set_value("fabric_gsm", fabric_gsm)
		frm.set_value("total_yarn_cost", total_yarn_cost)
		frm.refresh_fields()
	},

	on_table_size: function(frm, cdt, cdn) {
		var row = locals[cdt][cdn]
		$.each(frm.doc.fabric, function (idx, val) {
			if (val.norms==row.size_in){
				frappe.model.set_value(val.doctype, val.name, 'on_table', row.on_table_size)
			}
		})
		frm.refresh_fields()
	},

	finished_size: function(frm, cdt, cdn){
		var row = locals[cdt][cdn]
		var crimp_per = 0.0
		var crimp_cal = 0.0
		$.each(frm.doc.fabric, function (idx, val) {
			if (val.norms==row.size_in){
				frappe.model.set_value(val.doctype, val.name, "finished", row.finished_size)
			}
		})

		$.each(frm.doc.machine_detail, function (idx, val) {
			if((val.crimp_=="Warp") && (row.size_in=="Width (In Inches)")){
				var crimp_per = (flt(row.on_machine_size)-flt(row.finished_size))/row.finished_size*100
				crimp_per = parseFloat(crimp_per.toFixed(2))
				crimp_cal = (flt(val.on_machine)*(100+flt(crimp_per)))/100
				crimp_cal=parseFloat(crimp_cal.toFixed(2))
				frappe.model.set_value(val.doctype, val.name, 'crimp', crimp_per)
				frappe.model.set_value(val.doctype, val.name, 'with_crimp', crimp_cal)
			} else if ((val.crimp_=="Weft") && (row.size_in=="Length (In Inches)")){
				if (row.finished_size) {
					var crimp_per = (flt(row.on_machine_size)-flt(row.finished_size))/row.finished_size*100
					crimp_per = parseFloat(crimp_per.toFixed(2))
					crimp_cal = (flt(val.on_machine)*(100+flt(crimp_per)))/100
					crimp_cal=parseFloat(crimp_cal.toFixed(2))
					frappe.model.set_value(val.doctype, val.name, 'crimp', crimp_per)
					frappe.model.set_value(val.doctype, val.name, 'with_crimp', crimp_cal)
				}
			}
		})
		frm.refresh_fields();
	}

});

frappe.ui.form.on('Process Details', {
	process_type: function(frm, cdt, cdn){
		var row = locals[cdt][cdn];
		var total_cost = 0.0

		total_cost = flt(row.indicative_cost)+flt(row.manual_cots)
		frappe.model.set_value(row.doctype, row.name, 'total_cost', total_cost)

		// frappe.db.get_value("Process Head Type", {name: row.process_type}, "indicative_cost", (r) => {
		// 	frappe.model.set_value(row.doctype, row.name, "indicative_cost", r.indicative_cost)
		// 	var proc = frappe.model.add_child(frm.doc, "Weaving and Processing Costs", "weaving_processing_costs");
		// 	frappe.model.set_value(proc.doctype, proc.name, 'particulars', row.process_type)
		// 	frappe.model.set_value(proc.doctype, proc.name, 'uom', row.uom)
		// 	frappe.model.set_value(proc.doctype, proc.name, 'rate_per_process', r.indicative_cost)
		// 	if (row.uom=="Kg"){
		// 		cost=(frm.doc.total_warp_weft_weight*r.indicative_cost)/1000
		// 		frappe.model.set_value(proc.doctype, proc.name, 'cost', cost)
		// 	} else {
		// 		cost=(frm.doc.total_warp_weft_weight*r.indicative_cost)/39.37
		// 		frappe.model.set_value(proc.doctype, proc.name, 'cost', cost)
		// 	}
		// });
		frm.refresh_fields()
	},

	manual_cots: function(frm, cdt, cdn){
		var row = locals[cdt][cdn];
		var total_cost = 0.0
		total_cost = flt(row.indicative_cost)+flt(row.manual_cots)
		frappe.model.set_value(row.doctype, row.name, 'total_cost', total_cost)
		frm.refresh_fields()
	},

	total_cost: function(frm, cdt, cdn){
		var row = locals[cdt][cdn];
		var cost = 0.0
		var process_type = []
		$.each(frm.doc.weaving_processing_costs, function (idx, val) {
			process_type.push(val.particulars)
		})

		var finished_size = 0.0
		$.each(frm.doc.machine_details, function (idx, val) {
			if (val.size_in=="Width (In Inches)"){
				finished_size+=val.finished_size
			}
		})
		

		if(frm.doc.process[0] && frm.doc.weaving_processing_costs[0]){
			$.each(frm.doc.weaving_processing_costs, function (idx, val) {
				if (row.process_type == val.particulars){
					frappe.model.set_value(val.doctype, val.name, 'rate_per_process', row.total_cost)
					if (row.uom=="Kg"){
						cost=(frm.doc.total_warp_weft_weight*row.total_cost)/1000
						frappe.model.set_value(val.doctype, val.name, 'cost', cost)
					} else {
						cost=(finished_size*row.total_cost)/39.37
						frappe.model.set_value(val.doctype, val.name, 'cost', cost)
					}
				} else if (!process_type.includes(row.process_type)) {
					var proc = frappe.model.add_child(frm.doc, "Weaving and Processing Costs", "weaving_processing_costs");
					frappe.model.set_value(proc.doctype, proc.name, 'particulars', row.process_type)
					frappe.model.set_value(proc.doctype, proc.name, 'uom', row.uom)
					frappe.model.set_value(proc.doctype, proc.name, 'rate_per_process', row.total_cost)
					if (row.uom=="Kg"){
						cost=(frm.doc.total_warp_weft_weight*row.total_cost)/1000
						frappe.model.set_value(proc.doctype, proc.name, 'cost', cost)
					} else {
						cost=(finished_size*row.total_cost)/39.37
						frappe.model.set_value(proc.doctype, proc.name, 'cost', cost)
					}
				}
			})
		} else {
			var proc = frappe.model.add_child(frm.doc, "Weaving and Processing Costs", "weaving_processing_costs");
			frappe.model.set_value(proc.doctype, proc.name, 'particulars', row.process_type)
			frappe.model.set_value(proc.doctype, proc.name, 'uom', row.uom)
			frappe.model.set_value(proc.doctype, proc.name, 'rate_per_process', row.total_cost)
			if (row.uom=="Kg"){
				cost=(frm.doc.total_warp_weft_weight*row.total_cost)/1000
				frappe.model.set_value(proc.doctype, proc.name, 'cost', cost)
			} else {
				cost=(finished_size*row.total_cost)/39.37
				frappe.model.set_value(proc.doctype, proc.name, 'cost', cost)
			}
		}
		frm.refresh_fields()
	}

});


frappe.ui.form.on('Weaving Costs', {
	pick_rate: function(frm, cdt, cdn){
		var row = locals[cdt][cdn]
		var ppi = 0.0
		var length = 0.0
		var cost = 0.0
		$.each(frm.doc.fabric, function (idx, val) {
			if (val.norms=="PPI"){
				ppi+=val.on_loom
			} else if (val.norms=="Length (In Inches)") {
				length+=val.on_loom
			}
		})
		cost = ppi*(length/39.97)*row.pick_rate
		frappe.model.set_value(row.doctype, row.name, 'cost', cost)
		frm.refresh_fields()
	},

	cost: function(frm, cdt, cdn){
		var row = locals[cdt][cdn]
		var cost = 0.0
		$.each(frm.doc.weaving_costs, function (idx, val) {
			cost+=val.cost
		})
		$.each(frm.doc.weaving_processing_costs, function (idx, val) {
			cost+=val.cost
		})
		cost+=frm.doc.total_yarn_cost
		$.each(frm.doc.width_cost_per_linear_metre, function (idx, val) {
			cost = cost+(cost*(val.processing_wastage/100))
			frappe.model.set_value(val.doctype, val.name, "gsm", frm.doc.fabric_gsm)
			frappe.model.set_value(val.doctype, val.name, "cost_per_lm", cost)
		})
		frm.refresh_fields()
	}
})


frappe.ui.form.on('Weaving and Processing Costs', {
	cost: function(frm, cdt, cdn){
		var row = locals[cdt][cdn]
		var cost = 0.0
		$.each(frm.doc.weaving_costs, function (idx, val) {
			cost+=val.cost
		})
		$.each(frm.doc.weaving_processing_costs, function (idx, val) {
			cost+=val.cost
		})
		cost+=frm.doc.total_yarn_cost
		$.each(frm.doc.width_cost_per_linear_metre, function (idx, val) {
			cost = cost+(cost*(val.processing_wastage/100))
			frappe.model.set_value(val.doctype, val.name, "gsm", frm.doc.fabric_gsm)
			frappe.model.set_value(val.doctype, val.name, "cost_per_lm", cost)
		})
		frm.refresh_fields()
	}
})


frappe.ui.form.on('Backing Other Fabric Cost', {
	width: function(frm, cdt, cdn){
		var row = locals[cdt][cdn]
		var lm_price = 0.0
		lm_price = (row.gsm*row.per_kg_price/1000)*(row.width/39.37)
		lm_price=parseFloat(lm_price.toFixed(2))
		frappe.model.set_value(row.doctype, row.name, 'lm_price', lm_price)
		frm.refresh_fields()
	},
	gsm: function(frm, cdt, cdn){
		var row = locals[cdt][cdn]
		var lm_price = 0.0
		lm_price = (row.gsm*row.per_kg_price/1000)*(row.width/39.37)
		lm_price=parseFloat(lm_price.toFixed(2))
		frappe.model.set_value(row.doctype, row.name, 'lm_price', lm_price)
		frm.refresh_fields()
	},
	per_kg_price: function(frm, cdt, cdn){
		var row = locals[cdt][cdn]
		var lm_price = 0.0
		lm_price = (row.gsm*row.per_kg_price/1000)*(row.width/39.37)
		lm_price=parseFloat(lm_price.toFixed(2))
		frappe.model.set_value(row.doctype, row.name, 'lm_price', lm_price)
		frm.refresh_fields()
	},
	lm_price: function(frm, cdt, cdn){
		var row = locals[cdt][cdn]
		var total = 0.0
		total = flt(row.lm_price)+flt(row.processing_cost_if_any)
		frappe.model.set_value(row.doctype, row.name, 'total_cost', total)
		frm.refresh_fields()
	},
	processing_cost_if_any: function(frm, cdt, cdn){
		var row = locals[cdt][cdn]
		var total = 0.0
		total = flt(row.lm_price)+flt(row.processing_cost_if_any)
		frappe.model.set_value(row.doctype, row.name, 'total_cost', total)
		frm.refresh_fields()
	}
})

frappe.ui.form.on('Peice Cut Sizes', {
	product_name: function(frm, cdt, cdn){
		var row = locals[cdt][cdn]
		// frappe.call({
		// 	method: "get_data_for_peice_cut_sizes",
		// 	freeze: true,
		// 	doc: frm.doc,
		// 	callback: function() {
		// 		refresh_field("peice_cut_sizes");
		// 	}
		// });
		if (row.product_name){
			frappe.call({
				method: 'costing.costing.doctype.dapada_cost_sheet.dapada_cost_sheet.get_data_for_peice_cut_sizes',
				args: {
					product_name: row.product_name
				},
				callback: function(r) {
					if (r.message) {
						var data = r.message
						var count = 1
						$.each(data, function (idx, val) {
							if (count==1){
								count+=1
								frappe.model.set_value(row.doctype, row.name, 'front_back_filler', val.front_back_filler);
								frappe.model.set_value(row.doctype, row.name, 'width', val.width);
								frappe.model.set_value(row.doctype, row.name, 'length', val.length);
								frappe.model.set_value(row.doctype, row.name, 'cut_width', val.cut_width);
								frappe.model.set_value(row.doctype, row.name, 'cut_length', val.cut_length);
							} else {
								var proc = frappe.model.add_child(frm.doc, "Peice Cut Sizes", "peice_cut_sizes");
								proc.product_name = row.product_name
								frappe.model.set_value(proc.doctype, proc.name, 'front_back_filler', val.front_back_filler);
								frappe.model.set_value(proc.doctype, proc.name, 'width', val.width);
								frappe.model.set_value(proc.doctype, proc.name, 'length', val.length);
								frappe.model.set_value(proc.doctype, proc.name, 'cut_width', val.cut_width);
								frappe.model.set_value(proc.doctype, proc.name, 'cut_length', val.cut_length);	
							}
						})
					}
					frm.save()
					refresh_field("peice_cut_sizes");
				}
			});
		}
	}
})

frappe.ui.form.on('Product Cost', {
	stitch_cost: function(frm, cdt, cdn){
		var row = locals[cdt][cdn]
		var total = 0.0
		total = (flt(row.fabric_cost)+flt(row.stitch_cost)+flt(row.made_up_cost))*row.peices
		row.total_cost = total

		frappe.call({
			method: "calculate_stitch_cost_and_made_up_cost",
			freeze: true,
			doc: frm.doc,
			callback: function() {
				frm.refresh_fields();
			}
		});

		frm.refresh_fields()
	},
	made_up_cost: function(frm, cdt, cdn){
		var row = locals[cdt][cdn]
		var total = 0.0
		total = (flt(row.fabric_cost)+flt(row.stitch_cost)+flt(row.made_up_cost))*row.peices
		row.total_cost = total

		frappe.call({
			method: "calculate_stitch_cost_and_made_up_cost",
			freeze: true,
			doc: frm.doc,
			callback: function() {
				frm.refresh_fields();
			}
		});
		frm.refresh_fields()
	},

	peices: function(frm, cdt, cdn){
		var row = locals[cdt][cdn]
		var total = 0.0
		total = (flt(row.fabric_cost)+flt(row.stitch_cost)+flt(row.made_up_cost))*row.peices
		row.total_cost = total
		frappe.call({
			method: "calculate_stitch_cost_and_made_up_cost",
			freeze: true,
			doc: frm.doc,
			callback: function() {
				frm.refresh_fields();
			}
		});
		frm.refresh_fields()
	}
})

frappe.ui.form.on('Width Cost per Linear Metre', {
	width: function(frm, cdt, cdn){
		var row = locals[cdt][cdn]
		if (frm.doc.fabric_costing_summary[0]){
			$.each(frm.doc.fabric_costing_summary, function (idx, val) {
				if (val.idx==1){
					frappe.model.set_value(val.doctype, val.name, "width", row.width)
					frappe.model.set_value(val.doctype, val.name, "gsm", row.gsm)
					frappe.model.set_value(val.doctype, val.name, "cost", row.cost_per_lm)
				}
			})
		} else {
			var d = frappe.model.add_child(frm.doc, "Fabric Costing Summary", "fabric_costing_summary");
			d.width = row.width
			d.gsm = row.gsm
			d.cost = row.cost_per_lm
		}
		frm.refresh_fields()
	},
	gsm: function(frm, cdt, cdn){
		var row = locals[cdt][cdn]
		if (frm.doc.fabric_costing_summary[0]){
			$.each(frm.doc.fabric_costing_summary, function (idx, val) {
				if (val.idx==1){
					frappe.model.set_value(val.doctype, val.name, "width", row.width)
					frappe.model.set_value(val.doctype, val.name, "gsm", row.gsm)
					frappe.model.set_value(val.doctype, val.name, "cost", row.cost_per_lm)
				}
			})
		} else {
			var d = frappe.model.add_child(frm.doc, "Fabric Costing Summary", "fabric_costing_summary");
			d.width = row.width
			d.gsm = row.gsm
			d.cost = row.cost_per_lm
		}
		frm.refresh_fields()
	},

	processing_wastage: function(frm, cdt, cdn){
		var row = locals[cdt][cdn]
		var cost_ = 0.0
		$.each(frm.doc.weaving_costs, function (idx, val) {
			cost_+=val.cost
		})
		$.each(frm.doc.weaving_processing_costs, function (idx, val) {
			cost_+=val.cost
		})
		cost_+=frm.doc.total_yarn_cost
		cost_ = cost_+(cost_*(row.processing_wastage/100))
		frappe.model.set_value(row.doctype, row.name, "cost_per_lm", cost_)
	},

	cost_per_lm: function(frm, cdt, cdn){
		var row = locals[cdt][cdn]
		if (frm.doc.fabric_costing_summary[0]){
			$.each(frm.doc.fabric_costing_summary, function (idx, val) {
				if (val.idx==1){
					frappe.model.set_value(val.doctype, val.name, "width", row.width)
					frappe.model.set_value(val.doctype, val.name, "gsm", row.gsm)
					frappe.model.set_value(val.doctype, val.name, "cost", row.cost_per_lm)
				}
			})
		} else {
			var d = frappe.model.add_child(frm.doc, "Fabric Costing Summary", "fabric_costing_summary");
			d.width = row.width
			d.gsm = row.gsm
			d.cost = row.cost_per_lm
		}
		frm.refresh_fields()
	},
})


frappe.ui.form.on('Fabric Costing Summary', {
	sheet_name: function(frm, cdt, cdn){
		var row = locals[cdt][cdn]
		frappe.call({
			method: 'costing.costing.doctype.dapada_cost_sheet.dapada_cost_sheet.get_fabric_costing_summary_data',
			args: {
				sheet_name: row.sheet_name
			},
			callback: function(r) {
				if (r.message) {
					var data = r.message
					row.width = data.width;
					row.gsm = data.fabric_gsm;
					row.cost = data.cost
				}
				refresh_field("fabric_costing_summary");
			}
		});
	}
})

frappe.ui.form.on('Packaging Details', {
	no_of_pieces: function(frm, cdt, cdn){
		var row = locals[cdt][cdn]
		var amount = 0.0
		var packaging1 = 0.0
		var packaging2 = 0.0
		var packaging3 = 0.0
		var packaging4 = 0.0
		amount = row.no_of_pieces*row.rate
		row.amount = amount
		$.each(frm.doc.packaging1, function (idx, val) {
			packaging1+=val.amount
		})
		frm.set_value("packaging1_amt", packaging1)
		$.each(frm.doc.packaging2, function (idx, val) {
			packaging2+=val.amount
		})
		frm.set_value("packaging2_amt", packaging2)
		$.each(frm.doc.packaging3, function (idx, val) {
			packaging3+=val.amount
		})
		frm.set_value("packaging3_amt", packaging3)
		$.each(frm.doc.packaging4, function (idx, val) {
			packaging4+=val.amount
		})
		frm.set_value("packaging4_amt", packaging4)
		frm.refresh_fields()
	},
	rate: function(frm, cdt, cdn){
		var row = locals[cdt][cdn]
		var amount = 0.0
		var packaging1 = 0.0
		var packaging2 = 0.0
		var packaging3 = 0.0
		var packaging4 = 0.0
		amount = row.no_of_pieces*row.rate
		row.amount = amount
		$.each(frm.doc.packaging1, function (idx, val) {
			packaging1+=val.amount
		})
		frm.set_value("packaging1_amt", packaging1)
		$.each(frm.doc.packaging2, function (idx, val) {
			packaging2+=val.amount
		})
		frm.set_value("packaging2_amt", packaging2)
		$.each(frm.doc.packaging3, function (idx, val) {
			packaging3+=val.amount
		})
		frm.set_value("packaging3_amt", packaging3)
		$.each(frm.doc.packaging4, function (idx, val) {
			packaging4+=val.amount
		})
		frm.set_value("packaging4_amt", packaging4)
		frm.refresh_fields()
	}
})


frappe.ui.form.on('Transport Details Table', {
	container: function(frm, cdt, cdn){
		var row = locals[cdt][cdn]
		var net_amount = 0.0
		var cubic_metres_cbm = 0.0
		cubic_metres_cbm = (row.width*row.length*row.height)/1000000
		net_amount = cubic_metres_cbm*row.costcbm/row.no_of_piecescarton
		row.net_amount = net_amount
		frm.refresh_fields()

		frappe.call({
			method: "add_transport_in_final_summary",
			freeze: true,
			doc: frm.doc,
			callback: function() {
				frm.refresh_fields();
			}
		});
	},
	no_of_piecescarton: function(frm, cdt, cdn){
		var row = locals[cdt][cdn]
		var net_amount = 0.0
		var cubic_metres_cbm = 0.0
		cubic_metres_cbm = (row.width*row.length*row.height)/1000000
		net_amount = cubic_metres_cbm*row.costcbm/row.no_of_piecescarton
		row.net_amount = net_amount
		frm.refresh_fields()

		frappe.call({
			method: "add_transport_in_final_summary",
			freeze: true,
			doc: frm.doc,
			callback: function() {
				frm.refresh_fields();
			}
		});
	}

})


frappe.ui.form.on('Final Summary Cost', {
	value1: function(frm, cdt, cdn){
		var row = locals[cdt][cdn]
		frappe.call({
			method: "get_final_summary_data",
			freeze: true,
			doc: frm.doc,
			callback: function() {
				frm.refresh_fields();
			}
		});
	},
	value2: function(frm, cdt, cdn){
		var row = locals[cdt][cdn]
		frappe.call({
			method: "get_final_summary_data",
			freeze: true,
			doc: frm.doc,
			callback: function() {
				frm.refresh_fields();
			}
		});
	},
	value3: function(frm, cdt, cdn){
		var row = locals[cdt][cdn]
		frappe.call({
			method: "get_final_summary_data",
			freeze: true,
			doc: frm.doc,
			callback: function() {
				frm.refresh_fields();
			}
		});
	},
	value4: function(frm, cdt, cdn){
		var row = locals[cdt][cdn]
		frappe.call({
			method: "get_final_summary_data",
			freeze: true,
			doc: frm.doc,
			callback: function() {
				frm.refresh_fields();
			}
		});
	}
})


frappe.ui.form.on('Currency Summary', {
	exchange_rate: function(frm, cdt, cdn){
		var row = locals[cdt][cdn]
		var cost_usd = 0.0
		if (row.manual_exch_rate==0){
			cost_usd = row.cost_in_inr/row.exchange_rate
		}
		frappe.model.set_value(row.doctype, row.name, "cost_in_usd", cost_usd)
		frappe.call({
			method: "get_final_summary_data",
			freeze: true,
			doc: frm.doc,
			callback: function() {
				frm.refresh_fields();
			}
		});
		frm.refresh_fields()
	},

	manual_exch_rate: function(frm, cdt, cdn){
		var row = locals[cdt][cdn]
		var cost_usd = 0.0
		cost_usd = row.cost_in_inr/row.manual_exch_rate
		frappe.model.set_value(row.doctype, row.name, "cost_in_usd", cost_usd)
		frappe.call({
			method: "get_final_summary_data",
			freeze: true,
			doc: frm.doc,
			callback: function() {
				frm.refresh_fields();
			}
		});
		frm.refresh_fields()
	}
})

frappe.ui.form.on('Control Summary', {
	retail_cost: function(frm, cdt, cdn){
		var row = locals[cdt][cdn]
		var retail_ = 0.0
		retail_ = row.cost_in_usd/row.retail_cost
		frappe.model.set_value(row.doctype, row.name, "retail_", retail_)
		frm.refresh_fields()
	},
	total_qty: function(frm, cdt, cdn){
		var row = locals[cdt][cdn]
		var total_contribution = 0.0
		total_contribution = (row.contribution*row.total_qty)/100000
		frappe.model.set_value(row.doctype, row.name, "total_contribution_in_lakhs", total_contribution)
		frm.refresh_fields()
	}
})