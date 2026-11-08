const fs = require("fs");
const wf = JSON.parse(fs.readFileSync("target_workflow.json", "utf8"));
const trigger = wf.nodes.find(n => n.name === "WEBHOOK_TRIGGER1");
if (trigger) trigger.parameters.responseMode = "responseNode";
const checkChannel = {
  parameters: {
    conditions: {
      options: { caseSensitive: true, leftValue: "", typeValidation: "strict", version: 3 },
      conditions: [{ id: "1", leftValue: "={{ $json.body.channel }}", rightValue: "web", operator: { type: "string", operation: "equals", singleValue: true } }],
      combinator: "and"
    },
    options: {}
  },
  id: "check_channel_" + Date.now(),
  name: "Check Web Channel",
  type: "n8n-nodes-base.if",
  typeVersion: 3,
  position: [trigger.position[0] + 200, trigger.position[1]]
};
const respondWhatsApp = {
  parameters: { respondWith: "json", responseBody: "{\"status\":\"ok\"}", options: {} },
  id: "respond_wa_" + Date.now(),
  name: "Respond for WhatsApp",
  type: "n8n-nodes-base.respondToWebhook",
  typeVersion: 1.1,
  position: [trigger.position[0] + 400, trigger.position[1] + 200]
};
const respondWeb = {
  parameters: { respondWith: "json", responseBody: "={\n  \"ai_response\": \"{{ $json.output }}\"\n}", options: {} },
  id: "respond_web_" + Date.now(),
  name: "Respond for Web",
  type: "n8n-nodes-base.respondToWebhook",
  typeVersion: 1.1,
  position: [3400, -928]
};
wf.nodes.push(checkChannel, respondWhatsApp, respondWeb);
wf.connections["WEBHOOK_TRIGGER1"] = { main: [[{ node: "Check Web Channel", type: "main", index: 0 }]] };
wf.connections["Check Web Channel"] = {
  main: [
    [{ node: "TENANT_CONFIG1", type: "main", index: 0 }],
    [{ node: "Respond for WhatsApp", type: "main", index: 0 }]
  ]
};
wf.connections["Respond for WhatsApp"] = { main: [[{ node: "TENANT_CONFIG1", type: "main", index: 0 }]] };
const oldAiConnections = wf.connections["MAIN_AI_AGENT"];
wf.connections["MAIN_AI_AGENT"] = { main: [[{ node: "Respond for Web", type: "main", index: 0 }]] };
wf.connections["Respond for Web"] = oldAiConnections;
fs.writeFileSync("patched_workflow.json", JSON.stringify(wf, null, 2));
console.log("Successfully patched workflow!");
