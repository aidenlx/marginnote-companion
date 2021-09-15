import { Dict } from "./helper";

const dict: Dict = {
  cmd: {
    insert2doc: "将 MarginNote 数据插入当前笔记",
    insert2doc_tpl: "{{data_type}}（{{tplName}}模板）：插入到当前笔记",
    auto_paste: "开关自动粘贴（自动将收到的 MarginNote 数据插入当前笔记）",
  },
  notice: {
    error: {
      general: "{{action}}时出错，查看控制台了解详情",
      no_target_data: "来自 MarginNote 的{{type}}数据无法使用此模板",
      no_md_view: "目前没有活跃的笔记",
      no_mn_data: "没有接收到来自 MarginNote 的数据",
      no_tpl_found: "未找到名为{{tpl}}的{{type}}模板",
      render_error: "渲染{{type}}模板{{tpl}}失败，内部错误：{{error}}",
      body_missing_prop:
        "在{{time}}收到的MN数据中缺少{{prop}}，前往控制台查看更多细节",
    },
  },
  settings: {
    general: {
      heading: "一般设置",
      date_format_name: "日期时间格式",
      date_format_desc: "所有时间相关的变量都会使用该格式渲染日期时间",
      check_details: "点此查阅更多",
    },
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
      indent_char_name: "缩进符号",
      indent_char_desc:
        "打开开关使用内置缩进符(tab/空格)，关闭使用自定义缩进符",
      toggles_name: {
        pin: "固定到编辑器的右键菜单",
        cmd: "加入命令",
      },
      toggles_desc: {
        pin: "启用此选项可直接在编辑器菜单中选用此模板",
        cmd: "启用此选项可添加用此模板插入MarginNote数据到文档的的命令（重启Obsidian生效）",
      },
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
