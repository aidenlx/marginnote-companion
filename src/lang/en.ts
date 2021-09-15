const dict = {
  cmd: {
    insert2doc: "Insert MarginNote Data to Active Note",
    insert2doc_tpl:
      "{{data_type}}({{tplName}} Template): Insert to Active Note",
    auto_paste:
      "Toggle Auto Paste (Insert Recieved MarginNote Data to Active Note Automatically)",
  },
  notice: {
    error: {
      general: "Error while {{action}}, check console for details",
      no_target_data: "Recieved {{type}} data cannot use this template",
      no_md_view: "No Note is currently active",
      no_mn_data: "No MarginNote data recieved",
      no_tpl_found: "No template named {{tpl}} found for {{type}}",
      render_error:
        "Failed to render template named {{tpl}} for {{type}} data, internal error: {{error}}",
      body_missing_prop:
        "Missing {{prop}} in data sent in {{time}}, check console for more details",
    },
  },
  settings: {
    general: {
      heading: "General",
      date_format_name: "Date-Time format",
      date_format_desc:
        "All time-related varibale in the template file will be rendered in this format",
      check_details: "Check here for more details",
    },
    tpl_cfg: {
      heading: "Templates",
      headings: {
        note: "Note",
        sel: "Selection",
        toc: "Table of Contents",
      },
      tooltips: {
        add_new: "Add New Template",
        remove: "Remove Template",
        preview: "Preview with input",
        tpl_name: "Template Name (ID)",
      },
      indent_char_name: "Indent Character",
      indent_char_desc:
        "Toggle on to use built-in indent (tab/space) based on setting, off to use custom character",
      toggles_name: {
        pin: "Pin to Editor Menu",
        cmd: "Add to Command",
      },
      toggles_desc: {
        pin: "Enable this option to show this template in editor menu directly",
        cmd: "Enable this option to add command to insert MarginNote data to active note with this template (restart app to take effect)",
      },
      templates_name: {
        note_body: "Note Body",
        note_comment: "Comments",
        note_cmt_linked: "Merged Notes",
        sel: "Selection Template",
        toc_item: "Item Template",
      },
      templates_desc: {
        note_body:
          "Main template\nUse {{cmt_ph}} to insert comments and merged notes\n Accepted placeholders: {{phs}}",
        note_comment:
          "Subtemplate for comments\nAccepted placeholders: {{phs}}",
        note_cmt_linked:
          "Subtemplate for merged notes\nAccepted placeholders: {{phs}}",
        sel: "Template for inserted selections\nAccepted placeholders: {{phs}}",
        toc_item:
          "Template for inserted toc items, will be rendered line by line\nAccepted placeholders: {{phs}}",
      },
    },
  },
} as const;

export default dict;
