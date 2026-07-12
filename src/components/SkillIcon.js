import * as React from "react";
import {
  Activity,
  Binary,
  Blend,
  Bot,
  Boxes,
  BrainCircuit,
  Braces,
  ChartNoAxesCombined,
  ChartSpline,
  Clock3,
  Cloud,
  Cpu,
  Database,
  FileScan,
  FileText,
  Focus,
  Gauge,
  GitBranch,
  Hash,
  Image,
  Languages,
  Layers3,
  ListTree,
  MessagesSquare,
  Monitor,
  Network,
  PanelTop,
  Radar,
  Route,
  Rows3,
  ScanLine,
  ScanText,
  Search,
  ServerCog,
  SlidersHorizontal,
  Sparkles,
  Split,
  SquareTerminal,
  TableProperties,
  WandSparkles,
  Waypoints,
  Workflow,
} from "lucide-react";
import {
  siAiohttp,
  siApachekafka,
  siConfluence,
  siDjango,
  siDocker,
  siElasticsearch,
  siFastapi,
  siGit,
  siGithubactions,
  siGrafana,
  siGunicorn,
  siJira,
  siJavascript,
  siKibana,
  siKubernetes,
  siLangchain,
  siLanggraph,
  siLinux,
  siLogstash,
  siMilvus,
  siMongodb,
  siMysql,
  siNeo4j,
  siNestjs,
  siNextdotjs,
  siNotion,
  siNumpy,
  siOpencv,
  siPandas,
  siPostgresql,
  siPostman,
  siPrometheus,
  siPytorch,
  siPytest,
  siPython,
  siQdrant,
  siReact,
  siRedis,
  siScikitlearn,
  siStreamlit,
  siTailwindcss,
  siTensorflow,
  siTerraform,
  siUbuntu,
  siVuedotjs,
  siWeightsandbiases,
} from "simple-icons";

const BRAND_ICONS = new Map([
  ["Linux (Ubuntu)", siUbuntu],
  ["Linux", siLinux],
  ["Python", siPython],
  ["JavaScript", siJavascript],
  ["Next.js", siNextdotjs],
  ["React.js", siReact],
  ["Vue.js", siVuedotjs],
  ["Django", siDjango],
  ["Nest.js", siNestjs],
  ["Tailwind CSS", siTailwindcss],
  ["Langchain", siLangchain],
  ["Langgraph", siLanggraph],
  ["PyTorch", siPytorch],
  ["NumPy", siNumpy],
  ["Pandas", siPandas],
  ["OpenCV", siOpencv],
  ["Scikit-learn", siScikitlearn],
  ["TensorFlow", siTensorflow],
  ["FastAPI", siFastapi],
  ["Gunicorn", siGunicorn],
  ["aiohttp", siAiohttp],
  ["Streamlit", siStreamlit],
  ["MySQL", siMysql],
  ["PostgreSQL", siPostgresql],
  ["MongoDB", siMongodb],
  ["Qdrant", siQdrant],
  ["Milvus", siMilvus],
  ["Neo4j", siNeo4j],
  ["Redis", siRedis],
  ["Kafka", siApachekafka],
  ["Docker", siDocker],
  ["Docker-Compose", siDocker],
  ["Kubernetes", siKubernetes],
  ["Elasticsearch", siElasticsearch],
  ["Logstash", siLogstash],
  ["Kibana", siKibana],
  ["Prometheus", siPrometheus],
  ["Grafana", siGrafana],
  ["Terraform", siTerraform],
  ["wandb", siWeightsandbiases],
  ["Git", siGit],
  ["Jira", siJira],
  ["Confluence", siConfluence],
  ["Postman", siPostman],
  ["Notion", siNotion],
  ["pytest", siPytest],
  ["Github Actions", siGithubactions],
]);

const SEMANTIC_ICONS = new Map([
  ["Windows", [Monitor, "blue"]],
  ["UNIX", [SquareTerminal, "ink"]],
  ["MyBatis", [Braces, "warm"]],
  ["Langsmith", [Route, "green"]],
  ["Langfuse", [Activity, "warm"]],
  ["Pillow", [Image, "blue"]],
  ["ImageHash", [Hash, "green"]],
  ["Uvicorn", [ServerCog, "green"]],
  ["Oracle", [Database, "warm"]],
  ["AWS SageMaker", [BrainCircuit, "warm"]],
  ["AWS Lambda", [Workflow, "warm"]],
  ["EventBridge", [GitBranch, "warm"]],
  ["SQS", [MessagesSquare, "warm"]],
  ["DynamoDB", [Database, "warm"]],
  ["AWS CLI", [SquareTerminal, "warm"]],
  ["NCP", [Cloud, "blue"]],
  ["Loki", [ListTree, "blue"]],
  ["SLM", [Cpu, "green"]],
  ["LLM", [BrainCircuit, "blue"]],
  ["Embeddings", [Binary, "warm"]],
  ["Prompting", [MessagesSquare, "ink"]],
  ["Optimization", [SlidersHorizontal, "green"]],
  ["Serving", [ServerCog, "blue"]],
  ["Vector RAG", [Search, "blue"]],
  ["Graph RAG", [Network, "green"]],
  ["Hybrid Search", [Blend, "warm"]],
  ["Rank Fusion", [Split, "ink"]],
  ["Hierarchy Indexing", [ListTree, "green"]],
  ["Vector Database", [Database, "blue"]],
  ["Single Agent", [Bot, "warm"]],
  ["Multi-Agent", [Waypoints, "ink"]],
  ["Agent Orchestration", [Workflow, "green"]],
  ["Object Detection", [Focus, "green"]],
  ["Prompt Detection", [ScanLine, "blue"]],
  ["Open-World Detection", [Radar, "warm"]],
  ["Segmentation", [Layers3, "ink"]],
  ["Classification", [Rows3, "green"]],
  ["Pose Estimation", [Waypoints, "blue"]],
  ["Recommender Systems", [Sparkles, "green"]],
  ["GNN", [Network, "blue"]],
  ["GCN", [GitBranch, "warm"]],
  ["GIN", [Waypoints, "ink"]],
  ["Graph Optimization", [SlidersHorizontal, "green"]],
  ["Prediction", [ChartNoAxesCombined, "green"]],
  ["Regression", [ChartSpline, "blue"]],
  ["Time Series", [Clock3, "ink"]],
  ["Ensemble", [Boxes, "green"]],
  ["Structured Data", [TableProperties, "blue"]],
  ["Unstructured Data", [FileText, "warm"]],
  ["Hyperparameter Tuning", [SlidersHorizontal, "ink"]],
  ["NLP", [Languages, "green"]],
  ["Multilingual NLP", [Languages, "blue"]],
  ["Document Layout", [PanelTop, "warm"]],
  ["Document Parser", [FileScan, "ink"]],
  ["OCR", [ScanText, "green"]],
  ["Table Reconstruction", [TableProperties, "blue"]],
  ["OCR Benchmarking", [Gauge, "warm"]],
  ["Augmentation", [WandSparkles, "ink"]],
  ["Pre-processing", [SlidersHorizontal, "green"]],
  ["Post-processing", [SlidersHorizontal, "blue"]],
  ["Observability", [Activity, "warm"]],
  ["MLOps", [Workflow, "ink"]],
]);

const getReadableLogoColor = (hex) => {
  const normalizedHex = hex.padEnd(6, "0").slice(0, 6);
  const red = Number.parseInt(normalizedHex.slice(0, 2), 16);
  const green = Number.parseInt(normalizedHex.slice(2, 4), 16);
  const blue = Number.parseInt(normalizedHex.slice(4, 6), 16);
  const brightness = (red * 299 + green * 587 + blue * 114) / 1000;

  return brightness > 150 ? "#101820" : "#ffffff";
};

const getBrandStyle = (icon) => ({
  "--skill-icon-bg": `#${icon.hex}`,
  "--skill-icon-fg": getReadableLogoColor(icon.hex),
});

const SkillIcon = ({ name }) => {
  const brandIcon = BRAND_ICONS.get(name);

  if (brandIcon) {
    return (
      <span
        className="skill-logo-mark skill-logo-mark--brand"
        style={getBrandStyle(brandIcon)}
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" focusable="false">
          <path d={brandIcon.path} />
        </svg>
      </span>
    );
  }

  const [SemanticIcon, tone] = SEMANTIC_ICONS.get(name) ?? [Boxes, "ink"];

  return (
    <span
      className={`skill-logo-mark skill-logo-mark--semantic skill-logo-mark--${tone}`}
      aria-hidden="true"
    >
      <SemanticIcon focusable="false" strokeWidth={1.9} />
    </span>
  );
};

export default SkillIcon;
