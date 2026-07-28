import { NODE_COLORS, SHAPE_DEFAULT_SIZES, type CanvasShape } from "@/types/canvas"

export interface CanvasTemplateNode {
  id: string
  label: string
  shape: CanvasShape
  color: string
  textColor: string
  position: { x: number; y: number }
  width: number
  height: number
}

export interface CanvasTemplateEdge {
  id: string
  source: string
  target: string
  label?: string
}

export interface CanvasTemplate {
  id: string
  name: string
  description: string
  nodes: CanvasTemplateNode[]
  edges: CanvasTemplateEdge[]
}

function node(
  id: string,
  label: string,
  shape: CanvasShape,
  colorIndex: number,
  x: number,
  y: number
): CanvasTemplateNode {
  const { background, text } = NODE_COLORS[colorIndex]
  const { width, height } = SHAPE_DEFAULT_SIZES[shape]
  return { id, label, shape, color: background, textColor: text, position: { x, y }, width, height }
}

function edge(id: string, source: string, target: string, label?: string): CanvasTemplateEdge {
  return { id, source, target, label }
}

const microservices: CanvasTemplate = {
  id: "microservices",
  name: "Microservices",
  description: "An API gateway routing to independent services backed by a shared database.",
  nodes: [
    node("gateway", "API Gateway", "hexagon", 7, 260, 0),
    node("auth", "Auth Service", "rectangle", 1, 40, 180),
    node("users", "Users Service", "rectangle", 1, 260, 180),
    node("orders", "Orders Service", "rectangle", 1, 480, 180),
    node("database", "Database", "cylinder", 0, 260, 360),
  ],
  edges: [
    edge("gateway-auth", "gateway", "auth"),
    edge("gateway-users", "gateway", "users"),
    edge("gateway-orders", "gateway", "orders"),
    edge("users-database", "users", "database"),
    edge("orders-database", "orders", "database"),
  ],
}

const cicdPipeline: CanvasTemplate = {
  id: "cicd-pipeline",
  name: "CI/CD Pipeline",
  description: "A linear pipeline from commit through build, test, and deploy to production.",
  nodes: [
    node("commit", "Commit", "circle", 6, 0, 40),
    node("build", "Build", "rectangle", 1, 180, 30),
    node("test", "Test", "rectangle", 3, 400, 30),
    node("deploy", "Deploy", "rectangle", 5, 620, 30),
    node("production", "Production", "pill", 2, 820, 40),
  ],
  edges: [
    edge("commit-build", "commit", "build", "on push"),
    edge("build-test", "build", "test"),
    edge("test-deploy", "test", "deploy", "on pass"),
    edge("deploy-production", "deploy", "production"),
  ],
}

const eventDriven: CanvasTemplate = {
  id: "event-driven",
  name: "Event-Driven System",
  description: "A producer publishing events through a bus to multiple consumers and a data store.",
  nodes: [
    node("producer", "Producer", "rectangle", 4, 20, 160),
    node("bus", "Event Bus", "hexagon", 7, 260, 150),
    node("consumer-a", "Consumer A", "rectangle", 1, 500, 40),
    node("consumer-b", "Consumer B", "rectangle", 1, 500, 260),
    node("store", "Data Store", "cylinder", 0, 720, 260),
  ],
  edges: [
    edge("producer-bus", "producer", "bus", "publish"),
    edge("bus-consumer-a", "bus", "consumer-a"),
    edge("bus-consumer-b", "bus", "consumer-b"),
    edge("consumer-b-store", "consumer-b", "store"),
  ],
}

export const CANVAS_TEMPLATES: CanvasTemplate[] = [microservices, cicdPipeline, eventDriven]
