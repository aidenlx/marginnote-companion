const dict = {
  settings: {
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
      toggles_name: {
        pin: "Pin to Editor Menu",
      },
      toggles_desc: {
        pin: "Enable this option to show this template in editor menu directly",
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
