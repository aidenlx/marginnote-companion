import { Dict } from "./helper";

const dict: Dict = {
  settings: {
    tpl_cfg: {
      heading: "模板配置",
      headings: {
        note: "笔记",
        sel: "选中文本",
        toc: "目录",
      },
      tooltips: {
        add_new: "添加新模板",
        remove: "删除模板",
        preview: "读取MarginNote数据预览模板",
        tpl_name: "模板名称(ID)",
      },
      toggles_name: {
        pin: "固定到编辑器的右键菜单",
      },
      toggles_desc: {
        pin: "启用此选项可直接在编辑器菜单中选用此模板",
      },
      default_tpl_name: "默认模板",
      default_tpl_desc:
        "选择一个默认模板，在复制粘贴MarginNote数据到笔记时将使用此模板",
      templates_name: {
        note_body: "笔记正文",
        note_comment: "注释",
        note_cmt_linked: "合并的笔记",
        sel: "选中文本模板",
        toc_item: "目录子项目的模板",
      },
      templates_desc: {
        note_body:
          "笔记渲染的主模板\n可使用 {{cmt_ph}} 插入评论和合并笔记\n 接受的占位符：{{phs}}",
        note_comment: "用于渲染评论的子模板\n接受的占位符：{{phs}}",
        note_cmt_linked: "合并笔记的子模板\n接受的占位符：{{phs}}",
        sel: "用于渲染选中文本的模板\n接受的占位符：{{phs}}",
        toc_item:
          "渲染每个提取出的笔记的模板，将逐行呈现\n接受的占位符：{{phs}}",
      },
    },
  },
};

export default dict;
