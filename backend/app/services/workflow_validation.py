VALID_NODE_TYPES = {"manual_trigger", "webhook", "http", "condition", "webhook_action", "slack", "github"}

class WorkflowValidationError(Exception):
    pass

def validate_workflow_definition(definition: dict) -> None:
    if "nodes" not in definition or "edges" not in definition:
        raise WorkflowValidationError("Workflow must have 'nodes' and 'edges'")

    nodes = definition["nodes"]
    edges = definition["edges"]

    if not isinstance(nodes, list) or len(nodes) == 0:
        raise WorkflowValidationError("Workflow must have at least one node")

    node_ids = set()
    for node in nodes:
        if "id" not in node or "type" not in node:
            raise WorkflowValidationError("Each node needs an 'id' and 'type'")
        if node["id"] in node_ids:
            raise WorkflowValidationError(f"Duplicate node id: {node['id']}")
        if node["type"] not in VALID_NODE_TYPES:
            raise WorkflowValidationError(f"Unknown node type: {node['type']}")
        node_ids.add(node["id"])

    for edge in edges:
        print(edges)
        if not "to" in edge or not "from" in edge:
            raise WorkflowValidationError(f"Edge must have exactly 2 elements: {edge}")
        source = edge["from"]
        target = edge["to"]
        if source not in node_ids:
            raise WorkflowValidationError(f"Edge references unknown node: {source}")
        if target not in node_ids:
            raise WorkflowValidationError(f"Edge references unknown node: {target}")

    _check_no_cycles(node_ids, edges)


def _check_no_cycles(node_ids: set, edges: list) -> None:
    graph: dict[str, list[str]] = {node_id: [] for node_id in node_ids}
    for edge in edges:
        graph[edge["from"]].append(edge["to"])

    WHITE, GRAY, BLACK = 0, 1, 2
    color = {node_id: WHITE for node_id in node_ids}

    def visit(node_id: str):
        color[node_id] = GRAY
        for neighbor in graph[node_id]:
            if color[neighbor] == GRAY:
                raise WorkflowValidationError(f"Cycle detected involving node: {neighbor}")
            if color[neighbor] == WHITE:
                visit(neighbor)
        color[node_id] = BLACK

    for node_id in node_ids:
        if color[node_id] == WHITE:
            visit(node_id)