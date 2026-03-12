import { useState, useMemo, useCallback, useRef } from "react";
import {
  LineChart, Line, BarChart, Bar, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, ReferenceArea, Cell, AreaChart, Area
} from "recharts";
import { Activity, Heart, AlertTriangle, List, TrendingUp, PlusCircle, Upload, Search, ChevronLeft, ChevronRight, Globe, X } from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════
   MEDICAL CATEGORY MAPPING
   ═══════════════════════════════════════════════════════════════════ */
const CAT_ORDER=["kidney","blood","liver","heart","coag","lipid","metab","other"];
const CAT_META={
  kidney:{color:"#8b5cf6",bg:"#f5f3ff",border:"#ddd6fe",icon:"\u{1FAC0}"},
  blood:{color:"#ef4444",bg:"#fef2f2",border:"#fecaca",icon:"\u{1FA78}"},
  liver:{color:"#f59e0b",bg:"#fffbeb",border:"#fde68a",icon:"\u{1FAE7}"},
  heart:{color:"#ec4899",bg:"#fdf2f8",border:"#fbcfe8",icon:"\u2764\uFE0F"},
  coag:{color:"#06b6d4",bg:"#ecfeff",border:"#a5f3fc",icon:"\u{1FA79}"},
  lipid:{color:"#10b981",bg:"#ecfdf5",border:"#a7f3d0",icon:"\u{1F9EA}"},
  metab:{color:"#f97316",bg:"#fff7ed",border:"#fed7aa",icon:"\u26A1"},
  other:{color:"#6b7280",bg:"#f9fafb",border:"#e5e7eb",icon:"\u{1F9EC}"},
};
const TEST_CAT={
  "Cr":"kidney","BUN":"kidney","eGFR":"kidney","UA":"kidney","K":"kidney","Na":"kidney","Ca":"kidney","HCO3":"kidney","Cl":"kidney",
  "HGB":"blood","RBC":"blood","HCT":"blood","WBC":"blood","PLT":"blood","MCH":"blood","MCV":"blood",
  "NEUT#":"blood","LYMPH#":"blood","MONO#":"blood","EOS#":"blood","EOS%":"blood","BASO#":"blood","BASO%":"blood",
  "ALT":"liver","AST":"liver","ALP":"liver","ALB":"liver","GLB":"liver","TP":"liver",
  "BNP":"heart","CK-MB":"heart","LDH":"heart","CK":"heart",
  "PT":"coag","INR":"coag","FIB":"coag","FDP":"coag","D-dimer":"coag",
  "LDL-C":"lipid","TG":"lipid","TC":"lipid",
  "GLU":"metab","Ferritin":"metab","HbA1c":"metab",
};
const getCat=code=>TEST_CAT[code]||"other";

/* ═══════════════════════════════════════════════════════════════════
   LANGUAGE PACK
   ═══════════════════════════════════════════════════════════════════ */
const L = {
  en: {
    title:"Medical Lab Tracker", dashboard:"Dashboard", trends:"Trends",
    labResults:"Lab Results", abnormal:"Abnormal", dataEntry:"Data Entry",
    upload:"Upload File", dropHere:"Drop .csv file here or click to browse",
    noData:"No data loaded. Upload a file or enter data manually.",
    date:"Date", testCode:"Code", testName:"Test Name", result:"Result",
    unit:"Unit", refLow:"Ref Low", refHigh:"Ref High", status:"Status",
    normal:"Normal", low:"Low", high:"High", all:"All",
    search:"Search tests…", chartType:"Chart Type",
    line:"Line", bar:"Bar", scatter:"Scatter", area:"Area",
    violin:"Distribution", forest:"Forest", kaplan:"Timeline",
    selectTest:"Select a test", totalTests:"Total Tests",
    normalCt:"Normal", abnormalCt:"Abnormal", lowCt:"Low", highCt:"High",
    latest:"Latest Date", add:"Add Entry", save:"Save", cancel:"Cancel",
    value:"Value", refRange:"Ref Range", recentAbn:"Recent Abnormal",
    distrib:"Status Distribution", manual:"Manual Entry",
    file:"File", clear:"Clear", lang:"中文", opt:"optional",
    noTrend:"No trend data for this test", showing:"Showing", of:"of",
    res:"results", prev:"Prev", next:"Next", allDates:"All Dates",
    allStatus:"All Statuses", alerts:"Critical Alerts",
    loadDefault:"Load Sample Data", or:"or",
    merged:"Data merged successfully", newEntries:"new entries added",
    allCats:"All Categories", category:"Category",
    cat_kidney:"Kidney", cat_blood:"Blood", cat_liver:"Liver",
    cat_heart:"Heart", cat_coag:"Coagulation", cat_lipid:"Lipids",
    cat_metab:"Metabolism", cat_other:"Other",
    byCategory:"By Category", tests:"tests",
  },
  zh: {
    title:"医疗检验追踪器", dashboard:"仪表盘", trends:"趋势分析",
    labResults:"检验结果", abnormal:"异常项目", dataEntry:"数据录入",
    upload:"上传文件", dropHere:"拖拽 .csv 文件到此处或点击选择",
    noData:"暂无数据。请上传文件或手动录入。",
    date:"日期", testCode:"代码", testName:"检测名称", result:"结果",
    unit:"单位", refLow:"参考下限", refHigh:"参考上限", status:"状态",
    normal:"正常", low:"偏低", high:"偏高", all:"全部",
    search:"搜索检测项…", chartType:"图表类型",
    line:"折线图", bar:"柱状图", scatter:"散点图", area:"面积图",
    violin:"分布图", forest:"森林图", kaplan:"时间线",
    selectTest:"选择检测项目", totalTests:"检测总数",
    normalCt:"正常", abnormalCt:"异常", lowCt:"偏低", highCt:"偏高",
    latest:"最新日期", add:"添加记录", save:"保存", cancel:"取消",
    value:"数值", refRange:"参考范围", recentAbn:"近期异常",
    distrib:"状态分布", manual:"手动录入",
    file:"文件", clear:"清除", lang:"English", opt:"可选",
    noTrend:"该项目暂无趋势数据", showing:"显示", of:"/",
    res:"条结果", prev:"上一页", next:"下一页", allDates:"全部日期",
    allStatus:"全部状态", alerts:"关键警报",
    loadDefault:"加载示例数据", or:"或",
    merged:"数据已成功合并", newEntries:"条新数据已添加",
    allCats:"全部分类", category:"分类",
    cat_kidney:"肾脏", cat_blood:"血液", cat_liver:"肝脏",
    cat_heart:"心脏", cat_coag:"凝血", cat_lipid:"血脂",
    cat_metab:"代谢", cat_other:"其他",
    byCategory:"按分类", tests:"项",
  },
};

/* ═══════════════════════════════════════════════════════════════════
   DEFAULT EMBEDDED DATA (from your Excel file)
   ═══════════════════════════════════════════════════════════════════ */
const SAMPLE_LAB=[{date:"2026-01-10",testCode:"ALB",testNameCN:"白蛋白",result:31.9,unit:"g/L",refLow:35,refHigh:55,status:"偏低"},{date:"2026-01-10",testCode:"ALP",testNameCN:"碱性磷酸酶",result:42,unit:"U/L",refLow:40,refHigh:130,status:"正常"},{date:"2026-01-10",testCode:"ALT",testNameCN:"谷丙转氨酶",result:17,unit:"U/L",refLow:0,refHigh:40,status:"正常"},{date:"2026-01-10",testCode:"AST",testNameCN:"谷草转氨酶",result:19,unit:"U/L",refLow:0,refHigh:40,status:"正常"},{date:"2026-01-10",testCode:"BASO#",testNameCN:"嗜碱性粒细胞绝对值",result:0.18,unit:"10^9/L",refLow:0,refHigh:0.06,status:"偏高"},{date:"2026-01-10",testCode:"BASO%",testNameCN:"嗜碱性粒细胞百分数",result:2.3,unit:"%",refLow:0,refHigh:1,status:"偏高"},{date:"2026-01-10",testCode:"BNP",testNameCN:"B型钠尿肽",result:215,unit:"pg/mL",refLow:0,refHigh:97.3,status:"偏高"},{date:"2026-01-10",testCode:"CK-MB",testNameCN:"肌酸激酶同工酶",result:12.7,unit:"U/L",refLow:0,refHigh:25,status:"正常"},{date:"2026-01-10",testCode:"Ca",testNameCN:"钙",result:2.01,unit:"mmol/L",refLow:2,refHigh:2.7,status:"正常"},{date:"2026-01-10",testCode:"Cl",testNameCN:"氯",result:109.7,unit:"mmol/L",refLow:90,refHigh:110,status:"正常"},{date:"2026-01-10",testCode:"Cr",testNameCN:"肌酐",result:456,unit:"μmol/L",refLow:20,refHigh:115,status:"偏高"},{date:"2026-01-10",testCode:"EOS#",testNameCN:"嗜酸性粒细胞绝对值",result:0.5,unit:"10^9/L",refLow:0.02,refHigh:0.52,status:"正常"},{date:"2026-01-10",testCode:"EOS%",testNameCN:"嗜酸性粒细胞百分数",result:6.5,unit:"%",refLow:0.4,refHigh:8,status:"正常"},{date:"2026-01-10",testCode:"FDP",testNameCN:"纤维蛋白降解产物",result:2,unit:"mg/L",refLow:0,refHigh:5,status:"正常"},{date:"2026-01-10",testCode:"FIB",testNameCN:"纤维蛋白原",result:3.66,unit:"g/L",refLow:2,refHigh:4,status:"正常"},{date:"2026-01-10",testCode:"GLB",testNameCN:"球蛋白",result:20.1,unit:"g/L",refLow:20,refHigh:35,status:"正常"},{date:"2026-01-10",testCode:"HCT",testNameCN:"红细胞压积",result:0.28,unit:"L/L",refLow:0.4,refHigh:0.5,status:"偏低"},{date:"2026-01-10",testCode:"HGB",testNameCN:"血红蛋白",result:92,unit:"g/L",refLow:130,refHigh:175,status:"偏低"},{date:"2026-01-10",testCode:"INR",testNameCN:"国际标准化比值",result:0.9,unit:"",refLow:0.8,refHigh:1.6,status:"正常"},{date:"2026-01-10",testCode:"K",testNameCN:"钾",result:3.57,unit:"mmol/L",refLow:3.5,refHigh:5.5,status:"正常"},{date:"2026-01-10",testCode:"LDH",testNameCN:"乳酸脱氢酶",result:239,unit:"U/L",refLow:75,refHigh:245,status:"正常"},{date:"2026-01-10",testCode:"LYMPH#",testNameCN:"淋巴细胞绝对值",result:1.76,unit:"10^9/L",refLow:1.1,refHigh:3.2,status:"正常"},{date:"2026-01-10",testCode:"MCH",testNameCN:"平均红细胞血红蛋白量",result:29.7,unit:"pg",refLow:27,refHigh:34,status:"正常"},{date:"2026-01-10",testCode:"MCV",testNameCN:"平均红细胞体积",result:90.6,unit:"fL",refLow:82,refHigh:100,status:"正常"},{date:"2026-01-10",testCode:"MONO#",testNameCN:"单核细胞绝对值",result:0.27,unit:"10^9/L",refLow:0.1,refHigh:0.6,status:"正常"},{date:"2026-01-10",testCode:"NEUT#",testNameCN:"中性粒细胞绝对值",result:4.44,unit:"10^9/L",refLow:1.8,refHigh:6.3,status:"正常"},{date:"2026-01-10",testCode:"Na",testNameCN:"钠",result:141.6,unit:"mmol/L",refLow:135,refHigh:153,status:"正常"},{date:"2026-01-10",testCode:"PLT",testNameCN:"血小板计数",result:236,unit:"10^9/L",refLow:125,refHigh:350,status:"正常"},{date:"2026-01-10",testCode:"PT",testNameCN:"凝血酶原时间",result:10.1,unit:"s",refLow:8.8,refHigh:13.6,status:"正常"},{date:"2026-01-10",testCode:"RBC",testNameCN:"红细胞计数",result:3.09,unit:"10^12/L",refLow:4.3,refHigh:5.8,status:"偏低"},{date:"2026-01-10",testCode:"TP",testNameCN:"总蛋白",result:52,unit:"g/L",refLow:60,refHigh:85,status:"偏低"},{date:"2026-01-10",testCode:"UA",testNameCN:"尿酸",result:205,unit:"μmol/L",refLow:200,refHigh:440,status:"正常"},{date:"2026-01-10",testCode:"WBC",testNameCN:"白细胞计数",result:7.69,unit:"10^9/L",refLow:3.5,refHigh:9.5,status:"正常"},{date:"2026-01-10",testCode:"eGFR",testNameCN:"估算肾小球滤过率",result:13.906,unit:"mL/min/1.73m²",refLow:null,refHigh:null,status:"偏低"},{date:"2026-01-11",testCode:"Ferritin",testNameCN:"铁蛋白",result:153.7,unit:"ng/mL",refLow:30,refHigh:400,status:"正常"},{date:"2026-01-11",testCode:"GLU",testNameCN:"葡萄糖",result:4.4,unit:"mmol/L",refLow:3.6,refHigh:6.1,status:"正常"},{date:"2026-01-11",testCode:"HCO3",testNameCN:"碳酸氢盐",result:20.4,unit:"mmol/L",refLow:21,refHigh:32,status:"偏低"},{date:"2026-01-11",testCode:"HbA1c",testNameCN:"糖化血红蛋白",result:4.7,unit:"%",refLow:4,refHigh:6.5,status:"正常"},{date:"2026-01-11",testCode:"TC",testNameCN:"总胆固醇",result:5.98,unit:"mmol/L",refLow:null,refHigh:5.2,status:"偏高"},{date:"2026-01-11",testCode:"TG",testNameCN:"甘油三酯",result:2.52,unit:"mmol/L",refLow:null,refHigh:1.7,status:"偏高"},{date:"2026-01-14",testCode:"BASO#",testNameCN:"嗜碱性粒细胞绝对值",result:0.1,unit:"10^9/L",refLow:0,refHigh:0.06,status:"偏高"},{date:"2026-01-14",testCode:"BASO%",testNameCN:"嗜碱性粒细胞百分数",result:1.4,unit:"%",refLow:0,refHigh:1,status:"偏高"},{date:"2026-01-14",testCode:"EOS#",testNameCN:"嗜酸性粒细胞绝对值",result:0.34,unit:"10^9/L",refLow:0.02,refHigh:0.52,status:"正常"},{date:"2026-01-14",testCode:"EOS%",testNameCN:"嗜酸性粒细胞百分数",result:4.6,unit:"%",refLow:0.4,refHigh:8,status:"正常"},{date:"2026-01-14",testCode:"HCT",testNameCN:"红细胞压积",result:0.29,unit:"L/L",refLow:0.4,refHigh:0.5,status:"偏低"},{date:"2026-01-14",testCode:"HGB",testNameCN:"血红蛋白",result:98,unit:"g/L",refLow:130,refHigh:175,status:"偏低"},{date:"2026-01-14",testCode:"LYMPH#",testNameCN:"淋巴细胞绝对值",result:1.39,unit:"10^9/L",refLow:1.1,refHigh:3.2,status:"正常"},{date:"2026-01-14",testCode:"MCH",testNameCN:"平均红细胞血红蛋白量",result:31,unit:"pg",refLow:27,refHigh:34,status:"正常"},{date:"2026-01-14",testCode:"MCV",testNameCN:"平均红细胞体积",result:91.7,unit:"fL",refLow:82,refHigh:100,status:"正常"},{date:"2026-01-14",testCode:"MONO#",testNameCN:"单核细胞绝对值",result:0.57,unit:"10^9/L",refLow:0.1,refHigh:0.6,status:"正常"},{date:"2026-01-14",testCode:"NEUT#",testNameCN:"中性粒细胞绝对值",result:4.97,unit:"10^9/L",refLow:1.8,refHigh:6.3,status:"正常"},{date:"2026-01-14",testCode:"PLT",testNameCN:"血小板计数",result:230,unit:"10^9/L",refLow:125,refHigh:350,status:"正常"},{date:"2026-01-14",testCode:"RBC",testNameCN:"红细胞计数",result:3.16,unit:"10^12/L",refLow:4.3,refHigh:5.8,status:"偏低"},{date:"2026-01-14",testCode:"WBC",testNameCN:"白细胞计数",result:7.38,unit:"10^9/L",refLow:3.5,refHigh:9.5,status:"正常"},{date:"2026-01-20",testCode:"ALB",testNameCN:"白蛋白",result:32.6,unit:"g/L",refLow:35,refHigh:55,status:"偏低"},{date:"2026-01-20",testCode:"ALP",testNameCN:"碱性磷酸酶",result:48,unit:"U/L",refLow:40,refHigh:130,status:"正常"},{date:"2026-01-20",testCode:"ALT",testNameCN:"谷丙转氨酶",result:13,unit:"U/L",refLow:0,refHigh:40,status:"正常"},{date:"2026-01-20",testCode:"AST",testNameCN:"谷草转氨酶",result:15,unit:"U/L",refLow:0,refHigh:40,status:"正常"},{date:"2026-01-20",testCode:"BUN",testNameCN:"尿素",result:17.92,unit:"mmol/L",refLow:2.2,refHigh:8.2,status:"偏高"},{date:"2026-01-20",testCode:"Cl",testNameCN:"氯",result:108,unit:"mmol/L",refLow:90,refHigh:110,status:"正常"},{date:"2026-01-20",testCode:"Cr",testNameCN:"肌酐",result:517,unit:"μmol/L",refLow:20,refHigh:115,status:"偏高"},{date:"2026-01-20",testCode:"GLB",testNameCN:"球蛋白",result:19.7,unit:"g/L",refLow:20,refHigh:35,status:"偏低"},{date:"2026-01-20",testCode:"GLU",testNameCN:"葡萄糖",result:6.01,unit:"mmol/L",refLow:3.6,refHigh:6.1,status:"正常"},{date:"2026-01-20",testCode:"HCO3",testNameCN:"碳酸氢盐",result:15.6,unit:"mmol/L",refLow:21,refHigh:32,status:"偏低"},{date:"2026-01-20",testCode:"HCT",testNameCN:"红细胞压积",result:0.308,unit:"L/L",refLow:0.4,refHigh:0.5,status:"偏低"},{date:"2026-01-20",testCode:"HGB",testNameCN:"血红蛋白",result:99,unit:"g/L",refLow:130,refHigh:175,status:"偏低"},{date:"2026-01-20",testCode:"LDL-C",testNameCN:"低密度脂蛋白胆固醇",result:3.57,unit:"mmol/L",refLow:null,refHigh:3.4,status:"偏高"},{date:"2026-01-20",testCode:"MCH",testNameCN:"平均红细胞血红蛋白量",result:29.4,unit:"pg",refLow:27,refHigh:34,status:"正常"},{date:"2026-01-20",testCode:"MCV",testNameCN:"平均红细胞体积",result:91.8,unit:"fL",refLow:82,refHigh:100,status:"正常"},{date:"2026-01-20",testCode:"Na",testNameCN:"钠",result:140,unit:"mmol/L",refLow:135,refHigh:153,status:"正常"},{date:"2026-01-20",testCode:"PLT",testNameCN:"血小板计数",result:314,unit:"10^9/L",refLow:125,refHigh:350,status:"正常"},{date:"2026-01-20",testCode:"RBC",testNameCN:"红细胞计数",result:3.36,unit:"10^12/L",refLow:4.3,refHigh:5.8,status:"偏低"},{date:"2026-01-20",testCode:"TC",testNameCN:"总胆固醇",result:5.23,unit:"mmol/L",refLow:null,refHigh:5.2,status:"偏高"},{date:"2026-01-20",testCode:"TG",testNameCN:"甘油三酯",result:1.42,unit:"mmol/L",refLow:null,refHigh:1.7,status:"正常"},{date:"2026-01-20",testCode:"TP",testNameCN:"总蛋白",result:52.3,unit:"g/L",refLow:60,refHigh:85,status:"偏低"},{date:"2026-01-20",testCode:"WBC",testNameCN:"白细胞计数",result:5.49,unit:"10^9/L",refLow:3.5,refHigh:9.5,status:"正常"},{date:"2026-01-20",testCode:"eGFR",testNameCN:"估算肾小球滤过率",result:11.946,unit:"mL/min/1.73m²",refLow:null,refHigh:null,status:"偏低"},{date:"2026-02-03",testCode:"ALB",testNameCN:"白蛋白",result:31.5,unit:"g/L",refLow:35,refHigh:55,status:"偏低"},{date:"2026-02-03",testCode:"ALT",testNameCN:"谷丙转氨酶",result:39,unit:"U/L",refLow:0,refHigh:40,status:"正常"},{date:"2026-02-03",testCode:"AST",testNameCN:"谷草转氨酶",result:20,unit:"U/L",refLow:0,refHigh:40,status:"正常"},{date:"2026-02-03",testCode:"BASO#",testNameCN:"嗜碱性粒细胞绝对值",result:0.03,unit:"10^9/L",refLow:0,refHigh:0.06,status:"正常"},{date:"2026-02-03",testCode:"BASO%",testNameCN:"嗜碱性粒细胞百分数",result:0.3,unit:"%",refLow:0,refHigh:1,status:"正常"},{date:"2026-02-03",testCode:"BNP",testNameCN:"B型钠尿肽",result:94.33,unit:"pg/mL",refLow:0,refHigh:97.3,status:"正常"},{date:"2026-02-03",testCode:"CK",testNameCN:"肌酸激酶",result:25,unit:"U/L",refLow:39,refHigh:308,status:"偏低"},{date:"2026-02-03",testCode:"CK-MB",testNameCN:"肌酸激酶同工酶",result:11.4,unit:"U/L",refLow:0,refHigh:25,status:"正常"},{date:"2026-02-03",testCode:"Ca",testNameCN:"钙",result:2.11,unit:"mmol/L",refLow:2,refHigh:2.7,status:"正常"},{date:"2026-02-03",testCode:"Cl",testNameCN:"氯",result:111,unit:"mmol/L",refLow:90,refHigh:110,status:"偏高"},{date:"2026-02-03",testCode:"Cr",testNameCN:"肌酐",result:369,unit:"μmol/L",refLow:20,refHigh:115,status:"偏高"},{date:"2026-02-03",testCode:"D-dimer",testNameCN:"D-二聚体",result:0.35,unit:"mg/L",refLow:0,refHigh:0.3,status:"偏高"},{date:"2026-02-03",testCode:"EOS#",testNameCN:"嗜酸性粒细胞绝对值",result:0.01,unit:"10^9/L",refLow:0.02,refHigh:0.52,status:"偏低"},{date:"2026-02-03",testCode:"EOS%",testNameCN:"嗜酸性粒细胞百分数",result:0.1,unit:"%",refLow:0.4,refHigh:8,status:"偏低"},{date:"2026-02-03",testCode:"FDP",testNameCN:"纤维蛋白降解产物",result:2.62,unit:"mg/L",refLow:0,refHigh:5,status:"正常"},{date:"2026-02-03",testCode:"FIB",testNameCN:"纤维蛋白原",result:3.6,unit:"g/L",refLow:2,refHigh:4,status:"正常"},{date:"2026-02-03",testCode:"Ferritin",testNameCN:"铁蛋白",result:40.6,unit:"ng/mL",refLow:30,refHigh:400,status:"正常"},{date:"2026-02-03",testCode:"GLB",testNameCN:"球蛋白",result:17.1,unit:"g/L",refLow:20,refHigh:35,status:"偏低"},{date:"2026-02-03",testCode:"GLU",testNameCN:"葡萄糖",result:4.82,unit:"mmol/L",refLow:3.6,refHigh:6.1,status:"正常"},{date:"2026-02-03",testCode:"HCO3",testNameCN:"碳酸氢盐",result:20.4,unit:"mmol/L",refLow:21,refHigh:32,status:"偏低"},{date:"2026-02-03",testCode:"HCT",testNameCN:"红细胞压积",result:0.325,unit:"L/L",refLow:0.4,refHigh:0.5,status:"偏低"},{date:"2026-02-03",testCode:"HGB",testNameCN:"血红蛋白",result:106,unit:"g/L",refLow:130,refHigh:175,status:"偏低"},{date:"2026-02-03",testCode:"HbA1c",testNameCN:"糖化血红蛋白",result:4.4,unit:"%",refLow:4,refHigh:6.5,status:"正常"},{date:"2026-02-03",testCode:"INR",testNameCN:"国际标准化比值",result:0.91,unit:"",refLow:0.8,refHigh:1.6,status:"正常"},{date:"2026-02-03",testCode:"K",testNameCN:"钾",result:4.14,unit:"mmol/L",refLow:3.5,refHigh:5.5,status:"正常"},{date:"2026-02-03",testCode:"LDH",testNameCN:"乳酸脱氢酶",result:294,unit:"U/L",refLow:75,refHigh:245,status:"偏高"},{date:"2026-02-03",testCode:"LDL-C",testNameCN:"低密度脂蛋白胆固醇",result:2.52,unit:"mmol/L",refLow:null,refHigh:3.4,status:"正常"},{date:"2026-02-03",testCode:"LYMPH#",testNameCN:"淋巴细胞绝对值",result:1.44,unit:"10^9/L",refLow:1.1,refHigh:3.2,status:"正常"},{date:"2026-02-03",testCode:"MCH",testNameCN:"平均红细胞血红蛋白量",result:28.2,unit:"pg",refLow:27,refHigh:34,status:"正常"},{date:"2026-02-03",testCode:"MCV",testNameCN:"平均红细胞体积",result:86.7,unit:"fL",refLow:82,refHigh:100,status:"正常"},{date:"2026-02-03",testCode:"MONO#",testNameCN:"单核细胞绝对值",result:0.51,unit:"10^9/L",refLow:0.1,refHigh:0.6,status:"正常"},{date:"2026-02-03",testCode:"NEUT#",testNameCN:"中性粒细胞绝对值",result:9.61,unit:"10^9/L",refLow:1.8,refHigh:6.3,status:"偏高"},{date:"2026-02-03",testCode:"Na",testNameCN:"钠",result:143,unit:"mmol/L",refLow:135,refHigh:153,status:"正常"},{date:"2026-02-03",testCode:"PLT",testNameCN:"血小板计数",result:298,unit:"10^9/L",refLow:125,refHigh:350,status:"正常"},{date:"2026-02-03",testCode:"RBC",testNameCN:"红细胞计数",result:3.75,unit:"10^12/L",refLow:4.3,refHigh:5.8,status:"偏低"},{date:"2026-02-03",testCode:"TC",testNameCN:"总胆固醇",result:3.7,unit:"mmol/L",refLow:null,refHigh:5.2,status:"正常"},{date:"2026-02-03",testCode:"TG",testNameCN:"甘油三酯",result:1.42,unit:"mmol/L",refLow:null,refHigh:1.7,status:"正常"},{date:"2026-02-03",testCode:"TP",testNameCN:"总蛋白",result:48.6,unit:"g/L",refLow:60,refHigh:85,status:"偏低"},{date:"2026-02-03",testCode:"UA",testNameCN:"尿酸",result:298,unit:"μmol/L",refLow:200,refHigh:440,status:"正常"},{date:"2026-02-03",testCode:"WBC",testNameCN:"白细胞计数",result:11.61,unit:"10^9/L",refLow:3.5,refHigh:9.5,status:"偏高"},{date:"2026-02-03",testCode:"eGFR",testNameCN:"估算肾小球滤过率",result:17.954,unit:"mL/min/1.73m²",refLow:null,refHigh:null,status:"偏低"}];

const SAMPLE_TRENDS=[{testCode:"ALB",testName:"白蛋白",unit:"g/L",refLow:35,refHigh:55,values:{"2026-01-10":31.9,"2026-01-20":32.6,"2026-02-03":31.5}},{testCode:"ALP",testName:"碱性磷酸酶",unit:"U/L",refLow:40,refHigh:130,values:{"2026-01-10":42,"2026-01-20":48}},{testCode:"ALT",testName:"谷丙转氨酶",unit:"U/L",refLow:0,refHigh:40,values:{"2026-01-10":17,"2026-01-20":13,"2026-02-03":39}},{testCode:"AST",testName:"谷草转氨酶",unit:"U/L",refLow:0,refHigh:40,values:{"2026-01-10":19,"2026-01-20":15,"2026-02-03":20}},{testCode:"BASO#",testName:"嗜碱性粒细胞绝对值",unit:"10^9/L",refLow:0,refHigh:0.06,values:{"2026-01-10":0.18,"2026-01-14":0.1,"2026-02-03":0.03}},{testCode:"BASO%",testName:"嗜碱性粒细胞百分数",unit:"%",refLow:0,refHigh:1,values:{"2026-01-10":2.3,"2026-01-14":1.4,"2026-02-03":0.3}},{testCode:"BNP",testName:"B型钠尿肽",unit:"pg/mL",refLow:0,refHigh:97.3,values:{"2026-01-10":215,"2026-02-03":94.33}},{testCode:"CK-MB",testName:"肌酸激酶同工酶",unit:"U/L",refLow:0,refHigh:25,values:{"2026-01-10":12.7,"2026-02-03":11.4}},{testCode:"Ca",testName:"钙",unit:"mmol/L",refLow:2,refHigh:2.7,values:{"2026-01-10":2.01,"2026-02-03":2.11}},{testCode:"Cl",testName:"氯",unit:"mmol/L",refLow:90,refHigh:110,values:{"2026-01-10":109.7,"2026-01-20":108,"2026-02-03":111}},{testCode:"Cr",testName:"肌酐",unit:"μmol/L",refLow:20,refHigh:115,values:{"2026-01-10":456,"2026-01-20":517,"2026-02-03":369}},{testCode:"EOS#",testName:"嗜酸性粒细胞绝对值",unit:"10^9/L",refLow:0.02,refHigh:0.52,values:{"2026-01-10":0.5,"2026-01-14":0.34,"2026-02-03":0.01}},{testCode:"EOS%",testName:"嗜酸性粒细胞百分数",unit:"%",refLow:0.4,refHigh:8,values:{"2026-01-10":6.5,"2026-01-14":4.6,"2026-02-03":0.1}},{testCode:"FDP",testName:"纤维蛋白降解产物",unit:"mg/L",refLow:0,refHigh:5,values:{"2026-01-10":2,"2026-02-03":2.62}},{testCode:"FIB",testName:"纤维蛋白原",unit:"g/L",refLow:2,refHigh:4,values:{"2026-01-10":3.66,"2026-02-03":3.6}},{testCode:"GLB",testName:"球蛋白",unit:"g/L",refLow:20,refHigh:35,values:{"2026-01-10":20.1,"2026-01-20":19.7,"2026-02-03":17.1}},{testCode:"HCT",testName:"红细胞压积",unit:"L/L",refLow:0.4,refHigh:0.5,values:{"2026-01-10":0.28,"2026-01-14":0.29,"2026-01-20":0.308,"2026-02-03":0.325}},{testCode:"HGB",testName:"血红蛋白",unit:"g/L",refLow:130,refHigh:175,values:{"2026-01-10":92,"2026-01-14":98,"2026-01-20":99,"2026-02-03":106}},{testCode:"INR",testName:"国际标准化比值",unit:"",refLow:0.8,refHigh:1.6,values:{"2026-01-10":0.9,"2026-02-03":0.91}},{testCode:"K",testName:"钾",unit:"mmol/L",refLow:3.5,refHigh:5.5,values:{"2026-01-10":3.57,"2026-02-03":4.14}},{testCode:"LDH",testName:"乳酸脱氢酶",unit:"U/L",refLow:75,refHigh:245,values:{"2026-01-10":239,"2026-02-03":294}},{testCode:"LYMPH#",testName:"淋巴细胞绝对值",unit:"10^9/L",refLow:1.1,refHigh:3.2,values:{"2026-01-10":1.76,"2026-01-14":1.39,"2026-02-03":1.44}},{testCode:"MCH",testName:"平均红细胞血红蛋白量",unit:"pg",refLow:27,refHigh:34,values:{"2026-01-10":29.7,"2026-01-14":31,"2026-01-20":29.4,"2026-02-03":28.2}},{testCode:"MCV",testName:"平均红细胞体积",unit:"fL",refLow:82,refHigh:100,values:{"2026-01-10":90.6,"2026-01-14":91.7,"2026-01-20":91.8,"2026-02-03":86.7}},{testCode:"MONO#",testName:"单核细胞绝对值",unit:"10^9/L",refLow:0.1,refHigh:0.6,values:{"2026-01-10":0.27,"2026-01-14":0.57,"2026-02-03":0.51}},{testCode:"NEUT#",testName:"中性粒细胞绝对值",unit:"10^9/L",refLow:1.8,refHigh:6.3,values:{"2026-01-10":4.44,"2026-01-14":4.97,"2026-02-03":9.61}},{testCode:"Na",testName:"钠",unit:"mmol/L",refLow:135,refHigh:153,values:{"2026-01-10":141.6,"2026-01-20":140,"2026-02-03":143}},{testCode:"PLT",testName:"血小板计数",unit:"10^9/L",refLow:125,refHigh:350,values:{"2026-01-10":236,"2026-01-14":230,"2026-01-20":314,"2026-02-03":298}},{testCode:"PT",testName:"凝血酶原时间",unit:"s",refLow:8.8,refHigh:13.6,values:{"2026-01-10":10.1}},{testCode:"RBC",testName:"红细胞计数",unit:"10^12/L",refLow:4.3,refHigh:5.8,values:{"2026-01-10":3.09,"2026-01-14":3.16,"2026-01-20":3.36,"2026-02-03":3.75}},{testCode:"TP",testName:"总蛋白",unit:"g/L",refLow:60,refHigh:85,values:{"2026-01-10":52,"2026-01-20":52.3,"2026-02-03":48.6}},{testCode:"UA",testName:"尿酸",unit:"μmol/L",refLow:200,refHigh:440,values:{"2026-01-10":205,"2026-02-03":298}},{testCode:"WBC",testName:"白细胞计数",unit:"10^9/L",refLow:3.5,refHigh:9.5,values:{"2026-01-10":7.69,"2026-01-14":7.38,"2026-01-20":5.49,"2026-02-03":11.61}},{testCode:"eGFR",testName:"估算肾小球滤过率",unit:"mL/min/1.73m²",refLow:null,refHigh:null,values:{"2026-01-10":13.906,"2026-01-20":11.946,"2026-02-03":17.954}},{testCode:"Ferritin",testName:"铁蛋白",unit:"ng/mL",refLow:30,refHigh:400,values:{"2026-01-11":153.7,"2026-02-03":40.6}},{testCode:"GLU",testName:"葡萄糖",unit:"mmol/L",refLow:3.6,refHigh:6.1,values:{"2026-01-11":4.4,"2026-01-20":6.01,"2026-02-03":4.82}},{testCode:"HCO3",testName:"碳酸氢盐",unit:"mmol/L",refLow:21,refHigh:32,values:{"2026-01-11":20.4,"2026-01-20":15.6,"2026-02-03":20.4}},{testCode:"HbA1c",testName:"糖化血红蛋白",unit:"%",refLow:4,refHigh:6.5,values:{"2026-01-11":4.7,"2026-02-03":4.4}},{testCode:"TC",testName:"总胆固醇",unit:"mmol/L",refLow:null,refHigh:5.2,values:{"2026-01-11":5.98,"2026-01-20":5.23,"2026-02-03":3.7}},{testCode:"TG",testName:"甘油三酯",unit:"mmol/L",refLow:null,refHigh:1.7,values:{"2026-01-11":2.52,"2026-01-20":1.42,"2026-02-03":1.42}},{testCode:"BUN",testName:"尿素",unit:"mmol/L",refLow:2.2,refHigh:8.2,values:{"2026-01-20":17.92}},{testCode:"LDL-C",testName:"低密度脂蛋白胆固醇",unit:"mmol/L",refLow:null,refHigh:3.4,values:{"2026-01-20":3.57,"2026-02-03":2.52}},{testCode:"CK",testName:"肌酸激酶",unit:"U/L",refLow:39,refHigh:308,values:{"2026-02-03":25}},{testCode:"D-dimer",testName:"D-二聚体",unit:"mg/L",refLow:0,refHigh:0.3,values:{"2026-02-03":0.35}}];

const SAMPLE_ABN = SAMPLE_LAB.filter(r => r.status !== "正常").map(r => ({...r, testName: r.testNameCN}));
/* Auto-generated unique test definitions for dropdown */
const TEST_DEFS=(()=>{const m={};SAMPLE_LAB.forEach(r=>{if(!m[r.testCode])m[r.testCode]={testCode:r.testCode,testNameCN:r.testNameCN,unit:r.unit,refLow:r.refLow,refHigh:r.refHigh};});return Object.values(m).sort((a,b)=>a.testCode.localeCompare(b.testCode));})();

/* ═══════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════ */
const stColor = s => {
  if(!s) return "#94a3b8";
  const x = s.toLowerCase();
  if(x==="正常"||x==="normal") return "#10b981";
  if(x==="偏低"||x==="low") return "#3b82f6";
  if(x==="偏高"||x==="high") return "#ef4444";
  return "#94a3b8";
};
const stLabel = (s,lang) => {
  if(!s) return "";
  const x = s.toLowerCase();
  if(x==="正常"||x==="normal") return lang==="en"?"Normal":"正常";
  if(x==="偏低"||x==="low") return lang==="en"?"Low":"偏低";
  if(x==="偏高"||x==="high") return lang==="en"?"High":"偏高";
  return s;
};
const shortD = d => d ? d.slice(5) : "";

const Badge = ({status,lang}) => {
  const c = stColor(status);
  return <span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"2px 10px",borderRadius:20,fontSize:11,fontWeight:600,background:`${c}12`,color:c,border:`1px solid ${c}25`}}>
    <span style={{width:6,height:6,borderRadius:"50%",background:c}}/>{stLabel(status,lang)}
  </span>;
};

const Tip = ({active,payload,label}) => {
  if(!active||!payload?.length) return null;
  return <div style={{background:"rgba(255,255,255,.96)",border:"1px solid #e5e7eb",borderRadius:10,padding:"10px 14px",boxShadow:"0 6px 20px rgba(0,0,0,.1)",fontSize:12}}>
    <div style={{fontWeight:600,color:"#6b7280",marginBottom:4}}>{label}</div>
    {payload.map((p,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:6}}>
      <span style={{width:8,height:8,borderRadius:"50%",background:p.color||p.stroke}}/>{p.name}: <strong>{typeof p.value==="number"?p.value.toFixed(2):p.value}</strong>
    </div>)}
  </div>;
};

const Card = ({label,value,color,sub,icon}) => (
  <div className="metric-card" style={{background:"white",borderRadius:14,padding:"18px 22px",boxShadow:"0 1px 3px rgba(0,0,0,.05)",border:"1px solid #f1f1f4",flex:1,minWidth:130,transition:"transform .15s,box-shadow .15s",cursor:"default"}}
    onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 6px 16px rgba(0,0,0,.08)"}}
    onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="0 1px 3px rgba(0,0,0,.05)"}}>
    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
      {icon}{" "}<span style={{fontSize:12,color:"#6b7280",fontWeight:500}}>{label}</span>
    </div>
    <div style={{fontSize:26,fontWeight:700,color:color||"#1f2937",letterSpacing:"-.5px"}}>{value}</div>
    {sub&&<div style={{fontSize:11,color:"#9ca3af",marginTop:3}}>{sub}</div>}
  </div>
);

/* ═══════════════════════════════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════════════════════════════ */
export default function App(){
  const [lang,setLang]=useState("en");
  const [tab,setTab]=useState("dashboard");
  const [data,setData]=useState({labResults:SAMPLE_LAB,trends:SAMPLE_TRENDS,abnormal:SAMPLE_ABN});
  const [fname,setFname]=useState("medical_lab_tracker_clean.xlsx");
  const [q,setQ]=useState("");
  const [selTrend,setSelTrend]=useState("Cr");
  const [cType,setCType]=useState("line");
  const [showForm,setShowForm]=useState(false);
  const [pg,setPg]=useState(0);
  const [stFilt,setStFilt]=useState("all");
  const [dtFilt,setDtFilt]=useState("all");
  const [entry,setEntry]=useState({date:"",testCode:"",testNameCN:"",result:"",unit:"",refLow:"",refHigh:""});
  const [catFilt,setCatFilt]=useState("all");
  const [trendCat,setTrendCat]=useState("all");
  const fRef=useRef(null);
  const t=L[lang];
  const catLabel=k=>t["cat_"+k]||k;
  const PP=20;

  const loadSample=useCallback(()=>{
    setData({labResults:SAMPLE_LAB,trends:SAMPLE_TRENDS,abnormal:SAMPLE_ABN});
    setFname("medical_lab_tracker_clean.xlsx");
    setTab("dashboard");
    setSelTrend("Cr");
  },[]);

  const handleCSV=useCallback((file)=>{
    if(!file)return;
    const reader=new FileReader();
    reader.onload=(e)=>{
      const text=e.target.result;
      const lines=text.split("\n").filter(l=>l.trim());
      if(lines.length<2)return;
      const hdr=lines[0].split(",").map(h=>h.trim().replace(/^"|"$/g,""));
      const parsed=lines.slice(1).map(line=>{
        const vals=line.split(",").map(v=>v.trim().replace(/^"|"$/g,""));
        const obj={};
        hdr.forEach((h,i)=>{obj[h]=vals[i]||"";});
        return obj;
      });
      const newRows=parsed.map(r=>{
        const result=parseFloat(r.Result||r.result||0);
        const refLow=r["Ref Low"]!=null&&r["Ref Low"]!==""?parseFloat(r["Ref Low"]):null;
        const refHigh=r["Ref High"]!=null&&r["Ref High"]!==""?parseFloat(r["Ref High"]):null;
        let status=r.Status||r.status||"";
        if(!status){
          if(refLow!=null&&result<refLow) status="偏低";
          else if(refHigh!=null&&result>refHigh) status="偏高";
          else status="正常";
        }
        return {date:r.Date||r.date||"",testCode:r["Test Code"]||r.testCode||"",testNameCN:r["Test Name (CN)"]||r["Test Name"]||r.testName||"",result,unit:r.Unit||r.unit||"",refLow,refHigh,status};
      }).filter(r=>r.testCode&&r.date);
      /* Merge: dedupe by date+testCode, new data overwrites old */
      setData(prev=>{
        const existing=prev.labResults||[];
        const key=r=>r.date+"|"+r.testCode;
        const merged=new Map();
        existing.forEach(r=>merged.set(key(r),r));
        newRows.forEach(r=>merged.set(key(r),r));
        const allLab=[...merged.values()].sort((a,b)=>a.date.localeCompare(b.date)||a.testCode.localeCompare(b.testCode));
        const abn=allLab.filter(r=>r.status!=="正常"&&r.status?.toLowerCase()!=="normal").map(r=>({...r,testName:r.testNameCN}));
        const byCode={};
        allLab.forEach(r=>{
          if(!r.testCode||r.result==null)return;
          if(!byCode[r.testCode])byCode[r.testCode]={testCode:r.testCode,testName:r.testNameCN,unit:r.unit,refLow:r.refLow,refHigh:r.refHigh,values:{}};
          if(r.date)byCode[r.testCode].values[r.date]=r.result;
        });
        return {labResults:allLab,trends:Object.values(byCode),abnormal:abn};
      });
      setFname(file.name);
      setTab("dashboard");
    };
    reader.readAsText(file);
  },[]);

  const stats=useMemo(()=>{
    const lab=data.labResults;
    const total=lab.length;
    const normal=lab.filter(r=>r.status==="正常"||r.status?.toLowerCase()==="normal").length;
    const low=lab.filter(r=>r.status==="偏低"||r.status?.toLowerCase()==="low").length;
    const high=lab.filter(r=>r.status==="偏高"||r.status?.toLowerCase()==="high").length;
    const dates=[...new Set(lab.map(r=>r.date).filter(Boolean))].sort();
    return {total,normal,low,high,abn:low+high,latest:dates[dates.length-1]||"—",dates};
  },[data.labResults]);

  const fLab=useMemo(()=>{
    let l=data.labResults;
    if(q){const s=q.toLowerCase();l=l.filter(r=>(r.testCode||"").toLowerCase().includes(s)||(r.testNameCN||"").toLowerCase().includes(s));}
    if(stFilt!=="all")l=l.filter(r=>r.status===stFilt);
    if(dtFilt!=="all")l=l.filter(r=>r.date===dtFilt);
    if(catFilt!=="all")l=l.filter(r=>getCat(r.testCode)===catFilt);
    return l;
  },[data.labResults,q,stFilt,dtFilt,catFilt]);

  const fAbn=useMemo(()=>{
    let l=data.abnormal;
    if(q){const s=q.toLowerCase();l=l.filter(r=>(r.testCode||"").toLowerCase().includes(s)||(r.testName||"").toLowerCase().includes(s));}
    if(catFilt!=="all")l=l.filter(r=>getCat(r.testCode)===catFilt);
    return l;
  },[data.abnormal,q,catFilt]);

  const addEntry=()=>{
    if(!entry.date||!entry.testCode||!entry.result)return;
    const res=parseFloat(entry.result),rL=entry.refLow?parseFloat(entry.refLow):null,rH=entry.refHigh?parseFloat(entry.refHigh):null;
    let st="正常";if(rL!=null&&res<rL)st="偏低";else if(rH!=null&&res>rH)st="偏高";
    const e={date:entry.date,testCode:entry.testCode,testNameCN:entry.testNameCN,result:res,unit:entry.unit,refLow:rL,refHigh:rH,status:st};
    setData(prev=>{
      const key=r=>r.date+"|"+r.testCode;
      const merged=new Map();
      prev.labResults.forEach(r=>merged.set(key(r),r));
      merged.set(key(e),e);
      const allLab=[...merged.values()].sort((a,b)=>a.date.localeCompare(b.date)||a.testCode.localeCompare(b.testCode));
      const abn=allLab.filter(r=>r.status!=="正常"&&r.status?.toLowerCase()!=="normal").map(r=>({...r,testName:r.testNameCN}));
      const byCode={};
      allLab.forEach(r=>{
        if(!r.testCode||r.result==null)return;
        if(!byCode[r.testCode])byCode[r.testCode]={testCode:r.testCode,testName:r.testNameCN,unit:r.unit,refLow:r.refLow,refHigh:r.refHigh,values:{}};
        if(r.date)byCode[r.testCode].values[r.date]=r.result;
      });
      return {labResults:allLab,trends:Object.values(byCode),abnormal:abn};
    });
    setEntry({date:"",testCode:"",testNameCN:"",result:"",unit:"",refLow:"",refHigh:""});
    setShowForm(false);
  };

  const td=useMemo(()=>{
    if(!selTrend||!data.trends.length)return null;
    const item=data.trends.find(t=>t.testCode===selTrend);
    if(!item)return null;
    const pts=Object.entries(item.values).filter(([,v])=>v!=null).map(([d,v])=>({date:d,sd:shortD(d),value:Number(v)})).sort((a,b)=>a.date.localeCompare(b.date));
    return {...item,pts};
  },[selTrend,data.trends]);

  const distData=useMemo(()=>{
    if(!td||td.pts.length<2)return[];
    const vs=td.pts.map(p=>p.value),mn=Math.min(...vs),mx=Math.max(...vs),rng=mx-mn||1,bins=8,bw=rng/bins;
    return Array.from({length:bins},(_,i)=>{
      const lo=mn+i*bw,hi=lo+bw;
      return{range:`${lo.toFixed(1)}`,count:vs.filter(v=>v>=lo&&(i===bins-1?v<=hi:v<hi)).length,lo,hi};
    });
  },[td]);

  const forestD=useMemo(()=>data.trends.filter(t=>{const vs=Object.values(t.values).filter(v=>v!=null);return vs.length>0&&(t.refLow!=null||t.refHigh!=null)}).map(t=>{
    const vs=Object.values(t.values).filter(v=>v!=null).map(Number);
    const mean=vs.reduce((a,b)=>a+b,0)/vs.length;
    const rL=t.refLow??mean*0.5,rH=t.refHigh??mean*1.5,rng=rH-rL||1;
    const norm=Math.max(0,Math.min(100,((mean-rL)/rng)*100));
    return{name:t.testCode,fullName:t.testName,norm,rawMean:mean,unit:t.unit,inRange:mean>=(t.refLow??-Infinity)&&mean<=(t.refHigh??Infinity)};
  }).slice(0,15),[data.trends]);

  const stTimeline=useMemo(()=>{
    if(!td)return[];
    const item=data.trends.find(t=>t.testCode===selTrend);
    if(!item)return[];
    return td.pts.map(p=>{
      let s=1;if(item.refLow!=null&&p.value<item.refLow)s=0;if(item.refHigh!=null&&p.value>item.refHigh)s=2;
      return{...p,st:s};
    });
  },[td,selTrend,data.trends]);

  const catStats=useMemo(()=>{
    const m={};
    data.labResults.forEach(r=>{
      const c=getCat(r.testCode);
      if(!m[c])m[c]={total:0,abn:0};
      m[c].total++;
      if(r.status!=="正常"&&r.status?.toLowerCase()!=="normal")m[c].abn++;
    });
    return CAT_ORDER.filter(c=>m[c]).map(c=>({key:c,...m[c],label:c,meta:CAT_META[c]}));
  },[data.labResults]);

  const trendsByCategory=useMemo(()=>{
    const m={};
    data.trends.forEach(tr=>{
      const c=getCat(tr.testCode);
      if(!m[c])m[c]=[];
      m[c].push(tr);
    });
    return CAT_ORDER.filter(c=>m[c]).map(c=>({key:c,items:m[c]}));
  },[data.trends]);

  const has=data.labResults.length>0||data.trends.length>0;

  const distChart=useMemo(()=>[
    {name:t.normal,value:stats.normal,fill:"#10b981"},
    {name:t.low,value:stats.low,fill:"#3b82f6"},
    {name:t.high,value:stats.high,fill:"#ef4444"},
  ].filter(d=>d.value>0),[stats,t]);

  /* ── Chart renderer ──────────────────────────────────── */
  const renderChart=()=>{
    if(!td||td.pts.length===0)return <div style={{textAlign:"center",padding:40,color:"#9ca3af"}}>{t.noTrend}</div>;
    const{refLow:rL,refHigh:rH,unit:u,pts}=td;
    const vs=pts.map(p=>p.value);
    const yMn=Math.min(...vs,rL??Infinity)*.85, yMx=Math.max(...vs,rH??-Infinity)*1.15;
    const xA=<XAxis dataKey="sd" tick={{fontSize:11,fill:"#6b7280"}}/>;
    const yA=<YAxis domain={[yMn,yMx]} tick={{fontSize:11,fill:"#6b7280"}} width={55}/>;
    const grid=<CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/>;
    const tip=<Tooltip content={<Tip/>}/>;
    const refAr=rL!=null&&rH!=null?<ReferenceArea y1={rL} y2={rH} fill="#10b981" fillOpacity={.06} strokeOpacity={0}/>:null;
    const refLo=rL!=null?<ReferenceLine key="rlo" y={rL} stroke="#3b82f6" strokeDasharray="4 4" strokeWidth={1.5}/>:null;
    const refHi=rH!=null?<ReferenceLine key="rhi" y={rH} stroke="#ef4444" strokeDasharray="4 4" strokeWidth={1.5}/>:null;

    const cellColor=(v)=>{let f="#10b981";if(rL!=null&&v<rL)f="#3b82f6";if(rH!=null&&v>rH)f="#ef4444";return f;};

    if(cType==="line") return <ResponsiveContainer width="100%" height={360}><LineChart data={pts} margin={{top:15,right:25,left:10,bottom:5}}>{grid}{refAr}{xA}{yA}{tip}{refLo}{refHi}<Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2.5} dot={{fill:"#6366f1",r:5,strokeWidth:2,stroke:"#fff"}} name={t.value}/></LineChart></ResponsiveContainer>;
    if(cType==="bar") return <ResponsiveContainer width="100%" height={360}><BarChart data={pts} margin={{top:15,right:25,left:10,bottom:5}}>{grid}{refAr}{xA}{yA}{tip}{refLo}{refHi}<Bar dataKey="value" name={t.value} radius={[6,6,0,0]} barSize={36}>{pts.map((e,i)=><Cell key={i} fill={cellColor(e.value)} fillOpacity={.8}/>)}</Bar></BarChart></ResponsiveContainer>;
    if(cType==="scatter") return <ResponsiveContainer width="100%" height={360}><ScatterChart margin={{top:15,right:25,left:10,bottom:5}}>{grid}{refAr}<XAxis dataKey="sd" type="category" name="Date" tick={{fontSize:11,fill:"#6b7280"}}/><YAxis dataKey="value" type="number" domain={[yMn,yMx]} name="Value" tick={{fontSize:11,fill:"#6b7280"}} width={55}/>{tip}{refLo}{refHi}<Scatter name={t.value} data={pts} fill="#8b5cf6">{pts.map((e,i)=><Cell key={i} fill={cellColor(e.value)}/>)}</Scatter></ScatterChart></ResponsiveContainer>;
    if(cType==="area") return <ResponsiveContainer width="100%" height={360}><AreaChart data={pts} margin={{top:15,right:25,left:10,bottom:5}}>{grid}{refAr}{xA}{yA}{tip}{refLo}{refHi}<defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={.3}/><stop offset="95%" stopColor="#6366f1" stopOpacity={.02}/></linearGradient></defs><Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2.5} fill="url(#ag)" dot={{fill:"#6366f1",r:4,strokeWidth:2,stroke:"#fff"}} name={t.value}/></AreaChart></ResponsiveContainer>;

    if(cType==="violin"){
      if(distData.length===0)return <div style={{textAlign:"center",padding:40,color:"#9ca3af"}}>{t.noTrend}</div>;
      return <ResponsiveContainer width="100%" height={360}><BarChart data={distData} margin={{top:15,right:25,left:10,bottom:5}}>{grid}<XAxis dataKey="range" tick={{fontSize:10,fill:"#6b7280"}} angle={-20} textAnchor="end" height={50}/><YAxis tick={{fontSize:11,fill:"#6b7280"}} width={40}/>{tip}<Bar dataKey="count" name="Frequency" radius={[6,6,0,0]} barSize={28}>{distData.map((e,i)=>{let f="#8b5cf6";if(rL!=null&&e.hi<rL)f="#3b82f6";if(rH!=null&&e.lo>rH)f="#ef4444";return <Cell key={i} fill={f} fillOpacity={.75}/>})}</Bar></BarChart></ResponsiveContainer>;
    }

    if(cType==="forest"){
      if(!forestD.length)return <div style={{textAlign:"center",padding:40,color:"#9ca3af"}}>{t.noTrend}</div>;
      return <div style={{padding:"12px 0"}}><div style={{display:"flex",gap:12,marginBottom:12,padding:"0 16px",fontSize:11,color:"#6b7280"}}><span>← {t.low}</span><div style={{flex:1,height:1,background:"#e5e7eb",marginTop:6}}/><span style={{color:"#10b981",fontWeight:600}}>{t.refRange}</span><div style={{flex:1,height:1,background:"#e5e7eb",marginTop:6}}/><span>{t.high} →</span></div>
        {forestD.map((d,i)=><div key={i} style={{display:"flex",alignItems:"center",padding:"5px 16px",borderBottom:"1px solid #f9fafb"}}>
          <div style={{width:70,fontSize:11,fontWeight:600,color:"#374151"}}>{d.name}</div>
          <div style={{flex:1,position:"relative",height:22}}>
            <div style={{position:"absolute",left:0,right:0,top:"50%",height:1,background:"#e5e7eb",transform:"translateY(-50%)"}}/>
            <div style={{position:"absolute",left:"0%",width:"100%",top:"50%",height:18,transform:"translateY(-50%)",background:"#10b98110",borderRadius:4}}/>
            <div style={{position:"absolute",left:`${d.norm}%`,top:"50%",transform:"translate(-50%,-50%)",width:10,height:10,borderRadius:"50%",background:d.inRange?"#10b981":"#ef4444",border:"2px solid white",boxShadow:"0 1px 3px rgba(0,0,0,.2)"}}/>
          </div>
          <div style={{width:90,textAlign:"right",fontSize:11,color:"#6b7280"}}>{d.rawMean.toFixed(1)} {d.unit}</div>
        </div>)}
      </div>;
    }

    if(cType==="kaplan"){
      if(!stTimeline.length)return <div style={{textAlign:"center",padding:40,color:"#9ca3af"}}>{t.noTrend}</div>;
      return <ResponsiveContainer width="100%" height={360}><LineChart data={stTimeline} margin={{top:15,right:25,left:10,bottom:5}}>{grid}{refAr}{xA}{yA}{tip}{refLo}{refHi}<Line type="stepAfter" dataKey="value" stroke="#6366f1" strokeWidth={2.5} name={t.value} dot={({cx,cy,payload,index})=>{if(cx==null||cy==null)return null;return <circle key={index} cx={cx} cy={cy} r={6} fill={payload.st===0?"#3b82f6":payload.st===2?"#ef4444":"#10b981"} stroke="#fff" strokeWidth={2}/>;}}/></LineChart></ResponsiveContainer>;
    }
    return null;
  };

  const navItems=[
    {id:"dashboard",label:t.dashboard,Ic:Activity},
    {id:"trends",label:t.trends,Ic:TrendingUp},
    {id:"labResults",label:t.labResults,Ic:List},
    {id:"abnormal",label:t.abnormal,Ic:AlertTriangle},
    {id:"dataEntry",label:t.dataEntry,Ic:PlusCircle},
  ];

  const chartOpts=[
    {id:"line",l:t.line},{id:"bar",l:t.bar},{id:"scatter",l:t.scatter},{id:"area",l:t.area},
    {id:"violin",l:t.violin},{id:"forest",l:t.forest},{id:"kaplan",l:t.kaplan},
  ];

  /* ── Styles ───────────────────────────────────────────── */
  const inp={width:"100%",padding:"9px 12px",borderRadius:8,border:"1px solid #e5e7eb",fontSize:13,outline:"none",boxSizing:"border-box"};
  const thS={padding:"10px 14px",textAlign:"left",fontWeight:600,color:"#6b7280",fontSize:11,textTransform:"uppercase",letterSpacing:".5px",borderBottom:"1px solid #f0f0f0",position:"sticky",top:0,background:"#f9fafb",zIndex:1};
  const tdS={padding:"9px 14px",fontSize:13};

  return(
    <div style={{minHeight:"100vh",background:"linear-gradient(180deg,#f8f9fe 0%,#eef0f8 100%)",fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif"}}>
      {/* HEADER */}
      <div style={{background:"linear-gradient(135deg,#4f46e5,#7c3aed)",padding:"14px 28px",display:"flex",alignItems:"center",justifyContent:"space-between",boxShadow:"0 4px 20px rgba(79,70,229,.25)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <Heart size={20} color="#f0abfc" fill="#f0abfc"/>
          <h1 style={{fontSize:18,fontWeight:700,color:"white",margin:0}}>{t.title}</h1>
        </div>
        <button onClick={()=>setLang(lang==="en"?"zh":"en")} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 16px",borderRadius:20,background:"rgba(255,255,255,.15)",border:"1px solid rgba(255,255,255,.25)",color:"white",cursor:"pointer",fontSize:13,fontWeight:500,backdropFilter:"blur(4px)"}}>
          <Globe size={14}/> {t.lang}
        </button>
      </div>

      {/* NAV */}
      <div style={{background:"white",padding:"0 28px",borderBottom:"1px solid #f0f0f0",boxShadow:"0 1px 2px rgba(0,0,0,.03)"}}>
        <div style={{display:"flex",gap:2}}>
          {navItems.map(({id,label,Ic})=>(
            <button key={id} onClick={()=>{setTab(id);setPg(0);setQ("");setCatFilt("all");setTrendCat("all")}} style={{display:"flex",alignItems:"center",gap:7,padding:"13px 18px",border:"none",cursor:"pointer",fontSize:13,fontWeight:500,borderBottom:tab===id?"2px solid #6366f1":"2px solid transparent",color:tab===id?"#6366f1":"#6b7280",background:"transparent",transition:"color .15s"}}>
              <Ic size={16}/>{label}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div style={{padding:"22px 28px",maxWidth:1200,margin:"0 auto"}}>

      {/* ── Empty state ──────────────────────────────── */}
      {!has && tab!=="dataEntry" && (
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"55vh",gap:20}}>
          <Activity size={48} color="#d1d5db"/>
          <p style={{color:"#9ca3af",fontSize:14,margin:0}}>{t.noData}</p>
          <div style={{display:"flex",gap:12}}>
            <button onClick={loadSample} style={{background:"linear-gradient(135deg,#6366f1,#8b5cf6)",color:"white",border:"none",borderRadius:11,padding:"11px 24px",cursor:"pointer",fontSize:13,fontWeight:600,boxShadow:"0 4px 12px rgba(99,102,241,.3)"}}>
              <Heart size={14} style={{marginRight:6,verticalAlign:"middle"}}/>{t.loadDefault}
            </button>
            <button onClick={()=>setTab("dataEntry")} style={{background:"white",color:"#6366f1",border:"1px solid #e5e7eb",borderRadius:11,padding:"11px 24px",cursor:"pointer",fontSize:13,fontWeight:600}}>
              <Upload size={14} style={{marginRight:6,verticalAlign:"middle"}}/>{t.upload}
            </button>
          </div>
        </div>
      )}

      {/* ── Dashboard ────────────────────────────────── */}
      {has && tab==="dashboard" && (<div style={{display:"flex",flexDirection:"column",gap:20}}>
        <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
          <Card label={t.totalTests} value={stats.total} color="#6366f1" icon={<List size={15} color="#6366f1"/>}/>
          <Card label={t.normalCt} value={stats.normal} color="#10b981" sub={`${stats.total?((stats.normal/stats.total)*100).toFixed(0):0}%`} icon={<Activity size={15} color="#10b981"/>}/>
          <Card label={t.abnormalCt} value={stats.abn} color="#ef4444" sub={`${stats.low} ${t.low} / ${stats.high} ${t.high}`} icon={<AlertTriangle size={15} color="#ef4444"/>}/>
          <Card label={t.latest} value={stats.latest} color="#8b5cf6" icon={<TrendingUp size={15} color="#8b5cf6"/>}/>
        </div>
        {catStats.length>0 && <div>
          <h3 style={{fontSize:14,fontWeight:600,color:"#1f2937",margin:"0 0 12px"}}>{t.byCategory}</h3>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))",gap:10}}>
            {catStats.map(cs=>{const cm=cs.meta; return <button key={cs.key} onClick={()=>{setCatFilt(cs.key);setTab("labResults");setPg(0)}} style={{background:cm.bg,borderRadius:12,padding:"14px 16px",border:"1px solid "+cm.border,cursor:"pointer",textAlign:"left",transition:"transform .12s"}}
              onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"} onMouseLeave={e=>e.currentTarget.style.transform=""}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}><span style={{fontSize:16}}>{cm.icon}</span><span style={{fontSize:12,fontWeight:700,color:cm.color}}>{catLabel(cs.key)}</span></div>
              <div style={{fontSize:22,fontWeight:800,color:cm.color}}>{cs.total}</div>
              <div style={{fontSize:11,color:"#6b7280",marginTop:2}}>{cs.abn} {t.abnormalCt}</div>
            </button>;})}
          </div>
        </div>}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
          <div style={{background:"white",borderRadius:14,padding:20,boxShadow:"0 1px 3px rgba(0,0,0,.05)",border:"1px solid #f1f1f4"}}>
            <h3 style={{fontSize:14,fontWeight:600,color:"#1f2937",marginTop:0,marginBottom:14}}>{t.distrib}</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={distChart} layout="vertical" margin={{left:8}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false}/>
                <XAxis type="number" tick={{fontSize:11,fill:"#6b7280"}}/>
                <YAxis dataKey="name" type="category" tick={{fontSize:12,fill:"#6b7280"}} width={56}/>
                <Tooltip content={<Tip/>}/>
                <Bar dataKey="value" radius={[0,8,8,0]} barSize={22}>{distChart.map((e,i)=><Cell key={i} fill={e.fill} fillOpacity={.8}/>)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{background:"white",borderRadius:14,padding:20,boxShadow:"0 1px 3px rgba(0,0,0,.05)",border:"1px solid #f1f1f4"}}>
            <h3 style={{fontSize:14,fontWeight:600,color:"#1f2937",marginTop:0,marginBottom:14}}>{t.recentAbn}</h3>
            <div style={{maxHeight:200,overflowY:"auto"}}>
              {data.abnormal.slice(0,8).map((r,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid #f9fafb"}}>
                  <div><span style={{fontSize:12,fontWeight:600,color:"#374151"}}>{r.testCode||r.testName}</span><span style={{fontSize:11,color:"#9ca3af",marginLeft:6}}>{r.testName}</span></div>
                  <div style={{display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:12,fontWeight:600,color:"#374151"}}>{r.result} {r.unit}</span><Badge status={r.status} lang={lang}/></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {data.abnormal.length>0&&(
          <div style={{background:"linear-gradient(135deg,#fef2f2,#fff1f2)",borderRadius:14,padding:18,border:"1px solid #fecaca"}}>
            <h3 style={{fontSize:14,fontWeight:600,color:"#991b1b",margin:"0 0 10px",display:"flex",alignItems:"center",gap:7}}><AlertTriangle size={16}/>{t.alerts}</h3>
            <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
              {data.abnormal.slice(0,6).map((r,i)=>(
                <div key={i} style={{background:"white",borderRadius:9,padding:"8px 12px",border:`1px solid ${stColor(r.status)}25`,display:"flex",alignItems:"center",gap:6,fontSize:12}}>
                  <span style={{width:7,height:7,borderRadius:"50%",background:stColor(r.status)}}/>{r.testCode||r.testName}: {r.result} {r.unit} <Badge status={r.status} lang={lang}/>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>)}

      {/* ── Trends ────────────────────────────────────── */}
      {has && tab==="trends" && (<div style={{display:"flex",gap:18}}>
        <div style={{width:220,background:"white",borderRadius:14,padding:14,boxShadow:"0 1px 3px rgba(0,0,0,.05)",border:"1px solid #f1f1f4",maxHeight:"calc(100vh - 170px)",overflowY:"auto",flexShrink:0}}>
          <h4 style={{fontSize:11,fontWeight:600,color:"#6b7280",margin:"0 0 10px",textTransform:"uppercase",letterSpacing:".5px"}}>{t.selectTest}</h4>
          <select value={trendCat} onChange={e=>{setTrendCat(e.target.value);const items=data.trends.filter(tr=>getCat(tr.testCode)===(e.target.value==="all"?"":e.target.value)||e.target.value==="all");if(items.length>0&&!items.find(tr=>tr.testCode===selTrend))setSelTrend(items[0].testCode)}} style={{width:"100%",padding:"9px 10px",borderRadius:8,border:"1px solid #e5e7eb",fontSize:12,color:"#374151",background:"white",marginBottom:10,cursor:"pointer"}}>
            <option value="all">{t.allCats}</option>
            {CAT_ORDER.map(c=>{const cm=CAT_META[c];const cnt=data.trends.filter(tr=>getCat(tr.testCode)===c).length;return cnt>0?<option key={c} value={c}>{cm.icon} {catLabel(c)} ({cnt})</option>:null})}
          </select>
          {(trendCat==="all"?data.trends:data.trends.filter(tr=>getCat(tr.testCode)===trendCat)).map(tr=>{
            const hasV=Object.values(tr.values).some(v=>v!=null);
            const rc=getCat(tr.testCode),rcm=CAT_META[rc];
            return <button key={tr.testCode} onClick={()=>setSelTrend(tr.testCode)} style={{display:"flex",alignItems:"center",gap:8,width:"100%",textAlign:"left",padding:"8px 10px",marginBottom:2,borderRadius:8,border:"none",cursor:"pointer",background:selTrend===tr.testCode?"linear-gradient(135deg,#6366f1,#8b5cf6)":"transparent",color:selTrend===tr.testCode?"white":"#374151",opacity:hasV?1:.35,transition:"all .12s",fontSize:0}}>
              <span style={{fontSize:11,width:20,textAlign:"center",flexShrink:0}}>{rcm.icon}</span>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12,fontWeight:600}}>{tr.testCode}</div>
                <div style={{fontSize:10,opacity:.7,marginTop:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{tr.testName}</div>
              </div>
              <span style={{fontSize:9,opacity:.5,flexShrink:0}}>{Object.keys(tr.values).length}</span>
            </button>;
          })}
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",gap:5,marginBottom:14,flexWrap:"wrap",background:"white",borderRadius:11,padding:5,boxShadow:"0 1px 3px rgba(0,0,0,.05)",border:"1px solid #f1f1f4"}}>
            {chartOpts.map(ct=>(
              <button key={ct.id} onClick={()=>setCType(ct.id)} style={{padding:"7px 14px",borderRadius:7,border:"none",cursor:"pointer",fontSize:12,fontWeight:500,background:cType===ct.id?"linear-gradient(135deg,#6366f1,#8b5cf6)":"transparent",color:cType===ct.id?"white":"#6b7280",transition:"all .12s"}}>{ct.l}</button>
            ))}
          </div>
          <div style={{background:"white",borderRadius:14,padding:20,boxShadow:"0 1px 3px rgba(0,0,0,.05)",border:"1px solid #f1f1f4"}}>
            {td&&<div style={{marginBottom:14}}>
              <h3 style={{fontSize:16,fontWeight:700,color:"#1f2937",margin:0}}>{td.testCode} — {td.testName}</h3>
              <div style={{fontSize:12,color:"#6b7280",marginTop:3}}>{t.unit}: {td.unit} | {t.refRange}: {td.refLow??"—"} – {td.refHigh??"—"}</div>
            </div>}
            {renderChart()}
          </div>
          {td&&td.pts.length>0&&(
            <div style={{background:"white",borderRadius:14,padding:16,marginTop:14,boxShadow:"0 1px 3px rgba(0,0,0,.05)",border:"1px solid #f1f1f4"}}>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:8}}>
                {td.pts.map((p,i)=>{const c=stColor(td.refLow!=null&&p.value<td.refLow?"偏低":td.refHigh!=null&&p.value>td.refHigh?"偏高":"正常");
                  return <div key={i} style={{background:`${c}08`,borderRadius:9,padding:"9px 12px",border:`1px solid ${c}18`}}>
                    <div style={{fontSize:10,color:"#6b7280"}}>{p.date}</div>
                    <div style={{fontSize:17,fontWeight:700,color:c,marginTop:3}}>{p.value}</div>
                  </div>;})}
              </div>
            </div>
          )}
        </div>
      </div>)}

      {/* ── Lab Results ───────────────────────────────── */}
      {has && tab==="labResults" && (()=>{
        const tp=Math.ceil(fLab.length/PP),pd=fLab.slice(pg*PP,(pg+1)*PP);
        return <div style={{background:"white",borderRadius:14,overflow:"hidden",boxShadow:"0 1px 3px rgba(0,0,0,.05)",border:"1px solid #f1f1f4"}}>
          <div style={{display:"flex",gap:10,padding:14,borderBottom:"1px solid #f0f0f0",flexWrap:"wrap",alignItems:"center"}}>
            <div style={{position:"relative",flex:1,minWidth:180}}>
              <Search size={14} style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:"#9ca3af"}}/>
              <input type="text" value={q} onChange={e=>{setQ(e.target.value);setPg(0)}} placeholder={t.search} style={{...inp,paddingLeft:32}}/>
            </div>
            <select value={catFilt} onChange={e=>{setCatFilt(e.target.value);setPg(0)}} style={{padding:"9px 12px",borderRadius:8,border:"1px solid #e5e7eb",fontSize:12,color:"#374151",background:"white"}}>
              <option value="all">{t.allCats}</option>{CAT_ORDER.map(c=><option key={c} value={c}>{catLabel(c)}</option>)}
            </select>
            <select value={stFilt} onChange={e=>{setStFilt(e.target.value);setPg(0)}} style={{padding:"9px 12px",borderRadius:8,border:"1px solid #e5e7eb",fontSize:12,color:"#374151",background:"white"}}>
              <option value="all">{t.allStatus}</option><option value="正常">{t.normal}</option><option value="偏低">{t.low}</option><option value="偏高">{t.high}</option>
            </select>
            <select value={dtFilt} onChange={e=>{setDtFilt(e.target.value);setPg(0)}} style={{padding:"9px 12px",borderRadius:8,border:"1px solid #e5e7eb",fontSize:12,color:"#374151",background:"white"}}>
              <option value="all">{t.allDates}</option>{stats.dates.map(d=><option key={d} value={d}>{d}</option>)}
            </select>
            <span style={{fontSize:11,color:"#9ca3af"}}>{t.showing} {pd.length} {t.of} {fLab.length}</span>
          </div>
          <div style={{overflowX:"auto",maxHeight:"60vh"}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead><tr>{[t.date,t.category,t.testCode,t.testName,t.result,t.unit,t.refLow,t.refHigh,t.status].map(h=><th key={h} style={thS}>{h}</th>)}</tr></thead>
              <tbody>{pd.map((r,i)=>{const rc=getCat(r.testCode),rcm=CAT_META[rc]; return <tr key={i} style={{borderBottom:"1px solid #f9fafb"}} onMouseEnter={e=>e.currentTarget.style.background="#fafafa"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <td style={{...tdS,color:"#6b7280"}}>{r.date}</td>
                <td style={tdS}><span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"2px 8px",borderRadius:12,fontSize:10,fontWeight:600,background:rcm.bg,color:rcm.color,border:"1px solid "+rcm.border}}>{rcm.icon} {catLabel(rc)}</span></td>
                <td style={{...tdS,fontWeight:600,color:"#374151"}}>{r.testCode}</td>
                <td style={{...tdS,color:"#6b7280"}}>{r.testNameCN}</td>
                <td style={{...tdS,fontWeight:600,color:"#374151"}}>{r.result}</td>
                <td style={{...tdS,color:"#9ca3af"}}>{r.unit}</td>
                <td style={{...tdS,color:"#9ca3af"}}>{r.refLow??"—"}</td>
                <td style={{...tdS,color:"#9ca3af"}}>{r.refHigh??"—"}</td>
                <td style={tdS}><Badge status={r.status} lang={lang}/></td>
              </tr>;})}</tbody>
            </table>
          </div>
          {tp>1&&<div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,padding:14,borderTop:"1px solid #f0f0f0"}}>
            <button onClick={()=>setPg(Math.max(0,pg-1))} disabled={pg===0} style={{padding:"7px 12px",borderRadius:7,border:"1px solid #e5e7eb",background:"white",cursor:pg===0?"default":"pointer",opacity:pg===0?.4:1,fontSize:12,display:"flex",alignItems:"center",gap:3}}><ChevronLeft size={14}/>{t.prev}</button>
            <span style={{fontSize:12,color:"#6b7280"}}>{pg+1}/{tp}</span>
            <button onClick={()=>setPg(Math.min(tp-1,pg+1))} disabled={pg>=tp-1} style={{padding:"7px 12px",borderRadius:7,border:"1px solid #e5e7eb",background:"white",cursor:pg>=tp-1?"default":"pointer",opacity:pg>=tp-1?.4:1,fontSize:12,display:"flex",alignItems:"center",gap:3}}>{t.next}<ChevronRight size={14}/></button>
          </div>}
        </div>;
      })()}

      {/* ── Abnormal ──────────────────────────────────── */}
      {has && tab==="abnormal" && (
        <div style={{background:"white",borderRadius:14,overflow:"hidden",boxShadow:"0 1px 3px rgba(0,0,0,.05)",border:"1px solid #f1f1f4"}}>
          <div style={{display:"flex",gap:10,padding:14,borderBottom:"1px solid #f0f0f0",alignItems:"center",flexWrap:"wrap"}}>
            <div style={{position:"relative",flex:1,minWidth:180}}><Search size={14} style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:"#9ca3af"}}/>
            <input type="text" value={q} onChange={e=>setQ(e.target.value)} placeholder={t.search} style={{...inp,paddingLeft:32}}/></div>
            <select value={catFilt} onChange={e=>setCatFilt(e.target.value)} style={{padding:"9px 12px",borderRadius:8,border:"1px solid #e5e7eb",fontSize:12,color:"#374151",background:"white"}}>
              <option value="all">{t.allCats}</option>{CAT_ORDER.map(c=><option key={c} value={c}>{catLabel(c)}</option>)}
            </select>
          </div>
          <div style={{overflowX:"auto",maxHeight:"65vh"}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead><tr>{[t.date,t.category,t.testCode,t.testName,t.result,t.unit,t.refLow,t.refHigh,t.status].map(h=><th key={h} style={thS}>{h}</th>)}</tr></thead>
              <tbody>{fAbn.map((r,i)=>{const rc=getCat(r.testCode),rcm=CAT_META[rc]; return <tr key={i} style={{borderBottom:"1px solid #f9fafb"}} onMouseEnter={e=>e.currentTarget.style.background="#fef2f2"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <td style={{...tdS,color:"#6b7280"}}>{r.date}</td>
                <td style={tdS}><span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"2px 8px",borderRadius:12,fontSize:10,fontWeight:600,background:rcm.bg,color:rcm.color,border:"1px solid "+rcm.border}}>{rcm.icon} {catLabel(rc)}</span></td>
                <td style={{...tdS,fontWeight:600,color:"#374151"}}>{r.testCode}</td>
                <td style={{...tdS,color:"#6b7280"}}>{r.testName}</td>
                <td style={{...tdS,fontWeight:700,color:stColor(r.status)}}>{r.result}</td>
                <td style={{...tdS,color:"#9ca3af"}}>{r.unit}</td>
                <td style={{...tdS,color:"#9ca3af"}}>{r.refLow??"—"}</td>
                <td style={{...tdS,color:"#9ca3af"}}>{r.refHigh??"—"}</td>
                <td style={tdS}><Badge status={r.status} lang={lang}/></td>
              </tr>;})}</tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Data Entry ────────────────────────────────── */}
      {tab==="dataEntry" && (<div style={{display:"flex",flexDirection:"column",gap:20}}>
        <div style={{background:"white",borderRadius:14,padding:36,boxShadow:"0 1px 3px rgba(0,0,0,.05)",border:"2px dashed #d1d5db",textAlign:"center",cursor:"pointer",transition:"all .2s"}}
          onClick={()=>fRef.current?.click()}
          onDragOver={e=>{e.preventDefault();e.currentTarget.style.borderColor="#6366f1";e.currentTarget.style.background="#f5f3ff"}}
          onDragLeave={e=>{e.currentTarget.style.borderColor="#d1d5db";e.currentTarget.style.background="white"}}
          onDrop={e=>{e.preventDefault();e.currentTarget.style.borderColor="#d1d5db";e.currentTarget.style.background="white";handleCSV(e.dataTransfer.files[0])}}>
          <input ref={fRef} type="file" accept=".csv" style={{display:"none"}} onChange={e=>handleCSV(e.target.files[0])}/>
          <Upload size={28} color="#9ca3af" style={{marginBottom:10}}/>
          <h3 style={{fontSize:15,fontWeight:600,color:"#374151",margin:"0 0 6px"}}>{t.upload}</h3>
          <p style={{fontSize:12,color:"#9ca3af",margin:0}}>{t.dropHere}</p>
          {fname&&<div style={{marginTop:14,display:"inline-flex",alignItems:"center",gap:8,padding:"7px 14px",background:"#f0fdf4",borderRadius:8,border:"1px solid #bbf7d0"}}>
            <span style={{fontSize:12,color:"#15803d",fontWeight:500}}>{t.file}: {fname}</span>
            <button onClick={e=>{e.stopPropagation();setData({labResults:[],trends:[],abnormal:[]});setFname("")}} style={{background:"none",border:"none",cursor:"pointer",color:"#dc2626",padding:0}}><X size={14}/></button>
          </div>}
          {!has&&<div style={{marginTop:14}}><span style={{fontSize:12,color:"#6b7280"}}>{t.or} </span>
            <button onClick={e=>{e.stopPropagation();loadSample()}} style={{fontSize:12,color:"#6366f1",background:"none",border:"none",cursor:"pointer",fontWeight:600,textDecoration:"underline"}}>{t.loadDefault}</button>
          </div>}
        </div>

        <div style={{background:"white",borderRadius:14,padding:20,boxShadow:"0 1px 3px rgba(0,0,0,.05)",border:"1px solid #f1f1f4"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <h3 style={{fontSize:15,fontWeight:600,color:"#1f2937",margin:0}}>{t.manual}</h3>
            {!showForm&&<button onClick={()=>setShowForm(true)} style={{display:"flex",alignItems:"center",gap:5,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",color:"white",border:"none",borderRadius:9,padding:"9px 18px",cursor:"pointer",fontSize:12,fontWeight:600}}><PlusCircle size={14}/>{t.add}</button>}
          </div>
          {showForm&&<div style={{background:"#f9fafb",borderRadius:10,padding:18,marginBottom:14}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:10}}>
              <div><label style={{fontSize:11,color:"#6b7280",display:"block",marginBottom:3}}>{t.date} *</label>
                <input type="date" value={entry.date} onChange={e=>setEntry({...entry,date:e.target.value})} style={inp}/></div>
              <div><label style={{fontSize:11,color:"#6b7280",display:"block",marginBottom:3}}>{t.testCode} *</label>
                <select value={entry.testCode} onChange={e=>{const def=TEST_DEFS.find(d=>d.testCode===e.target.value);if(def){setEntry({...entry,testCode:def.testCode,testNameCN:def.testNameCN,unit:def.unit,refLow:def.refLow!=null?String(def.refLow):"",refHigh:def.refHigh!=null?String(def.refHigh):""});}else{setEntry({...entry,testCode:e.target.value,testNameCN:"",unit:"",refLow:"",refHigh:""});}}} style={inp}>
                  <option value="">{t.selectTest}</option>
                  {CAT_ORDER.map(cat=>{const items=TEST_DEFS.filter(d=>getCat(d.testCode)===cat);if(!items.length)return null;return <optgroup key={cat} label={CAT_META[cat].icon+" "+catLabel(cat)}>{items.map(d=><option key={d.testCode} value={d.testCode}>{d.testCode} — {d.testNameCN}</option>)}</optgroup>;})}
                </select></div>
              <div><label style={{fontSize:11,color:"#6b7280",display:"block",marginBottom:3}}>{t.testName}</label>
                <input type="text" value={entry.testNameCN} readOnly style={{...inp,background:"#f3f4f6",color:"#6b7280"}}/></div>
              <div><label style={{fontSize:11,color:"#6b7280",display:"block",marginBottom:3}}>{t.result} *</label>
                <input type="number" step="any" value={entry.result} onChange={e=>setEntry({...entry,result:e.target.value})} style={inp}/></div>
              <div><label style={{fontSize:11,color:"#6b7280",display:"block",marginBottom:3}}>{t.unit}</label>
                <input type="text" value={entry.unit} readOnly style={{...inp,background:"#f3f4f6",color:"#6b7280"}}/></div>
              <div><label style={{fontSize:11,color:"#6b7280",display:"block",marginBottom:3}}>{t.refLow}</label>
                <input type="text" value={entry.refLow} readOnly style={{...inp,background:"#f3f4f6",color:"#6b7280"}}/></div>
              <div><label style={{fontSize:11,color:"#6b7280",display:"block",marginBottom:3}}>{t.refHigh}</label>
                <input type="text" value={entry.refHigh} readOnly style={{...inp,background:"#f3f4f6",color:"#6b7280"}}/></div>
            </div>
            <div style={{display:"flex",gap:8,marginTop:14,justifyContent:"flex-end"}}>
              <button onClick={()=>setShowForm(false)} style={{padding:"9px 18px",borderRadius:8,border:"1px solid #e5e7eb",background:"white",cursor:"pointer",fontSize:12,color:"#6b7280"}}>{t.cancel}</button>
              <button onClick={addEntry} style={{padding:"9px 18px",borderRadius:8,border:"none",background:"linear-gradient(135deg,#10b981,#059669)",color:"white",cursor:"pointer",fontSize:12,fontWeight:600}}>{t.save}</button>
            </div>
          </div>}
          {data.labResults.length>0&&<div style={{fontSize:12,color:"#6b7280"}}>{data.labResults.length} {t.res}</div>}
        </div>
      </div>)}

      </div>
    </div>
  );
}
