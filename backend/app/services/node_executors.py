import requests

def execute_http_node(node: dict) -> dict:
    """
    Executes a single HTTP node.
    'node' is a plain dict, e.g.:
    {"type": "http", "config": {"method": "GET", "url": "https://example.com"}}
    """
    config = node["config"]              # dict access, not dot access — this came from JSON
    method = config["method"]            # e.g. "GET" or "POST"
    url = config["url"]

    if method == "GET":
        response = requests.get(url)
    elif method == "POST":
        body = config.get("body", {})    # .get() so it doesn't crash if "body" is missing
        response = requests.post(url, json=body)
    else:
        raise ValueError(f"Unsupported HTTP method: {method}")

    return {
        "status_code": response.status_code,
        "data": response.json() if response.content else None
    }
    
    
def execute_condition_node(node: dict, previous_output: dict) -> bool:
    """
    Evaluates a condition node against the previous node's output.
    node config looks like:
    {"field": "data.total_sales", "operator": ">", "value": 1000}
    """
    config = node["config"]
    field = config["field"]
    operator = config["operator"]
    target_value = config["value"]

    # Walk the dotted path to extract the actual value
    parts = field.split(".")
    current = previous_output
    for part in parts:
        current = current[part]

    # Now compare
    if operator == ">":
        return current > target_value
    elif operator == "<":
        return current < target_value
    elif operator == "==":
        return current == target_value
    elif operator == ">=":
        return current >= target_value
    elif operator == "<=":
        return current <= target_value
    else:
        raise ValueError(f"Unsupported operator: {operator}")
    

def find_next_node_id(current_node_id, edges, condition_result=None):
    for edge in edges:
        if edge["from"] != current_node_id:
            continue  # not the edge we're looking for, skip it

        edge_condition = edge.get("condition", None)

        if edge_condition is None:
            # plain edge, no branching — this is the one
            return edge["to"]
        elif edge_condition == condition_result:
            # condition edge, and it matches our computed result
            return edge["to"]

    return None  # no matching edge found — workflow ends here


def run_workflow(workflow_def: dict) -> dict:
    """
    Runs a full workflow given its definition dict:
    {"nodes": [...], "edges": [...]}
    """
    nodes = workflow_def["nodes"]
    edges = workflow_def["edges"]

    # Build a lookup so we can find a node's full data by its id
    nodes_by_id = {node["id"]: node for node in nodes}

    # Find the trigger node to start from
    current_node_id = next(node["id"] for node in nodes if node["type"] == "manual_trigger")

    previous_output = None
    execution_log = []

    while current_node_id is not None:
        current_node = nodes_by_id[current_node_id]
        node_type = current_node["type"]

        if node_type == "http":
            previous_output = execute_http_node(current_node)
            condition_result = None

        elif node_type == "condition":
            condition_result = execute_condition_node(current_node, previous_output)
            previous_output = {"result": condition_result}

        elif node_type == "manual_trigger":
            condition_result = None  # trigger does nothing, just a starting point

        else:
            raise ValueError(f"Unknown node type: {node_type}")

        execution_log.append({"node_id": current_node_id, "output": previous_output})

        current_node_id = find_next_node_id(current_node_id, edges, condition_result)

    return {"log": execution_log, "final_output": previous_output}