// Copyright (c) 2023, Indictrans and contributors
// For license information, please see license.txt

frappe.ui.form.on('Unique Product Form', {
	refresh: function(frm) {
		if (frm.doc.__islocal) {
			frm.set_value("posting_date", frappe.datetime.get_today())
			var stitch = ["Backing Thread", "Labour Charges"]
			$.each(stitch, function(i, v){
				var d = frappe.model.add_child(frm.doc, "Stitch", "stitch");
				d.stitch_type=v
			});
			frm.refresh_field("stitch");
		}

		frm.add_custom_button(__('Get Data'), function() {
			frm.trigger('get_unique_product_form');
		});

		frm.add_custom_button(__('Create Cost Estimate'), function() {
			// frappe.model.open_mapped_doc({
			// 	method: "costing.costing.doctype.unique_product_form.unique_product_form.make_cost_estimate",
			// 	frm: cur_frm
			// })

			frappe.call({
				method: 'create_cost_estimate',
				doc: frm.doc,
				args: {doc:frm.doc},
			}).then(() => {
				frm.refresh_field();
			});
		});
	},

	get_unique_product_form: function(frm) {
		new frappe.ui.form.MultiSelectDialog({
		    doctype: "Unique Product Form",
		    target: frm,
		    setters: {
		        buyer:  undefined,
		        final_ref_no:  undefined
		    },
		    add_filters_group: 1,
		    date_field: "date",
		    columns: ["buyer", "final_ref_no"],
		    get_query() {
		        return {
		            filters: { docstatus: ['!=', 2] }
		        }
		    },
		    action(selections) {
		        frappe.call({
					method: 'set_value_on_uniqueproductform',
					doc: frm.doc,
					args: selections,
				}).then(() => {
					frm.refresh_fields();
				});
				cur_dialog.hide();
		    }
		});
	},

	packing_components_template: function(frm) {
		frappe.call({
			method: 'get_packing_components_template',
			doc: frm.doc,
			args: {doc:frm.doc},
		}).then(() => {
			frm.refresh_fields();
		});
	},

	get_size_and_gsm_for_cost_sheet: function(frm) {
		// frm.clear_table("gsm_breakup_summary")
		frappe.call({
			method: 'get_cost_sheet_for_size',
			doc: frm.doc,
			args: {doc:frm.doc},
		}).then(() => {
			frm.refresh_field("cost_sheet_for_size");
			frm.refresh_fields("gsm_breakup_summary");
			frm.refresh_field("carton_table");
		});
	}

});

frappe.ui.form.on('Size Breakup Table', {
	size_in: function(frm,cdt,cdn) {
		var row = locals[cdt][cdn];
		if (row.size_in=="Inch"){
			// var df=frappe.meta.get_docfield("Size Breakup Table", "width", frm.doc.name);
			// df.hidden=1;
			row.width_in_cms = Math.round(row.width*2.54)
			row.length_in_cms = Math.round(row.length*2.54)
		} else {
			row.width_in_cms = row.width
			row.length_in_cms = row.length
		}
		frm.refresh_fields();
	},

	width: function(frm,cdt,cdn) {
		var row = locals[cdt][cdn];
		if (row.size_in=="Inch"){
			row.width_in_cms = Math.round(row.width*2.54)
		} else {
			row.width_in_cms = row.width
		}
		frm.refresh_fields();
	},

	length: function(frm,cdt,cdn) {
		var row = locals[cdt][cdn];
		if (row.size_in=="Inch"){
			row.length_in_cms = Math.round(row.length*2.54)
		} else {
			row.length_in_cms = row.length
		}
		frm.refresh_fields();
	}
});


frappe.ui.form.on('Packing Components Table', {
	quantity: function(frm,cdt,cdn) {
		var row = locals[cdt][cdn];
		var amount = 0.0
		amount = row.rate/row.quantity
		frappe.model.set_value(row.doctype, row.name, 'amount', amount)
		frm.refresh_fields();
	},

	rate: function(frm, cdt, cdn) {
		var row = locals[cdt][cdn];
		var amount = 0.0
		amount = row.rate/row.quantity
		frappe.model.set_value(row.doctype, row.name, 'amount', amount)
		frm.refresh_fields();
	},
	amount: function(frm, cdt, cdn) {
		var row = locals[cdt][cdn];
		var total_amount = 0.0
		$.each(frm.doc.packing_components_table, function (idx, val) {
			total_amount+=val.amount
		})
		frm.set_value("total_amount", total_amount)
	} 
});


frappe.ui.form.on('Yarn', {
	resultant_yarn: function(frm,cdt,cdn) {
		var row = locals[cdt][cdn];
		if (row.idx==1) {
			row.percent = 100
		} 
		frm.refresh_fields();
	},
	"percent": function(frm, cdt, cdn){
		var row = locals[cdt][cdn];
		var totpercent = 0.0
		$.each(frm.doc.yarn, function (idx, val) {
			totpercent=totpercent+val.percent
		});
		if (totpercent>100){
			row.percent = 0.0
			frappe.validated = false;
			frm.refresh_fields();
			frappe.throw("Yarn percent should be 100%")
		}
	}

});


frappe.ui.form.on('Cost Sheet for Size', {
	before_cost_sheet_for_size_remove: function(frm, cdt, cdn) {
		var row = locals[cdt][cdn];
		var gsm_breakup_summary = []
		var carton_table = []
		$.each(frm.doc.gsm_breakup_summary, function (idx, val) {
			if (row.cost_sheet_no!=val.cost_sheet_no){
				gsm_breakup_summary.push(val)
			}
		})

		$.each(frm.doc.carton_table, function (idx, val) {
			if (row.cost_sheet_no!=val.cost_sheet_no){
				carton_table.push(val)
			}
		})
		
		frm.clear_table("gsm_breakup_summary")
		frm.clear_table("carton_table")
		$.each(gsm_breakup_summary, function (idx, val) {
			var d = frappe.model.add_child(frm.doc, "GSM Breakup Summary", "gsm_breakup_summary");
			frappe.model.set_value(d.doctype, d.name, 'size', val.size)
			frappe.model.set_value(d.doctype, d.name, 'item_code', val.item_code)
			frappe.model.set_value(d.doctype, d.name, 'gsm', val.gsm)
			frappe.model.set_value(d.doctype, d.name, 'cost_sheet_no', val.cost_sheet_no)
		})

		$.each(carton_table, function (idx, val) {
			var d = frappe.model.add_child(frm.doc, "Carton Table", "carton_table");
			frappe.model.set_value(d.doctype, d.name, 'size', val.size)
			frappe.model.set_value(d.doctype, d.name, 'cost_sheet_no', val.cost_sheet_no)
			frappe.model.set_value(d.doctype, d.name, 'width', val.width)
			frappe.model.set_value(d.doctype, d.name, 'length', val.length)
			frappe.model.set_value(d.doctype, d.name, 'height', val.height)
			frappe.model.set_value(d.doctype, d.name, 'no_of_pieces', val.no_of_pieces)
		})
		frm.refresh_fields();
	}
});