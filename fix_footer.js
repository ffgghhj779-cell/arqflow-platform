const fs = require("fs");
let content = fs.readFileSync("public/widget.js", "utf8");

const footerCss = `
    .arqflow-footer {
      text-align: center;
      padding: 2px 12px 10px;
      font-size: 11px;
      color: #94a3b8;
      background: white;
    }
    .arqflow-footer a {
      color: #94a3b8;
      text-decoration: none;
      font-weight: 600;
      transition: color 0.2s;
    }
    .arqflow-footer a:hover {
      color: var(--widget-color, #2563eb);
    }
`;

content = content.replace("</style>", footerCss + "</style>");

const footerHtml = `
      </form>
      <div class="arqflow-footer">
        ???? ?????? <a href="#" target="_blank" id="arqflow-brand-link">Arq Flow</a>
      </div>
    </div>
`;

content = content.replace("</form>\n    </div>", footerHtml);

const configJs = `
        config.logo_url = apiConfig.logo_url || data.logo_url || "";
        
        const brandLink = document.getElementById("arqflow-brand-link");
        if (brandLink) {
          brandLink.href = data.powered_by_url || "https://arqflow.com";
          brandLink.textContent = data.powered_by_name || "Arq Flow";
        }
`;

content = content.replace("config.logo_url = apiConfig.logo_url || data.logo_url || \"\";", configJs);

fs.writeFileSync("public/widget.js", content, "utf8");
console.log("Footer added!");
