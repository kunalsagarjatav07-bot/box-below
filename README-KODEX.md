# Kodex.sbs: Setup, Local Run, and Online Deployment

Owner: Kunal Sagar. Kodex.sbs is a customized AI development workspace based on an open-source Bolt.new fork.

## 1. Run locally on Windows (CMD)

1. Install **Node.js 20.15.1 LTS** (not 22 or 24). Corepack comes with it.
2. Extract the ZIP and open the `Kodex.sbs` folder.
3. Double-click `START-KODEX.bat`. It checks Node, creates `.env.local`, installs locked dependencies, builds, and starts the server.
4. Open `http://localhost:3000`.

Or run it manually in CMD from the project folder:

```bat
corepack pnpm@9.4.0 install --frozen-lockfile
copy .env.example .env.local
corepack pnpm run start
```

Add only the API keys you own to `.env.local`. Keep the startup window open. If the server stops, the error is printed there.

Every start writes a `.dev.vars` file from `.env.local`. Empty keys are skipped. Never upload `.env.local` or `.dev.vars` to GitHub.

## 2. Put it on GitHub

1. Create a new empty repository on GitHub (for example `kodex-sbs`). Do not add a README or license there.
2. In the project folder, run:

```bat
git init
git add .
git commit -m "Kodex.sbs initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/kodex-sbs.git
git push -u origin main
```

`.gitignore` already excludes `.env.local`, `.dev.vars`, `node_modules`, and `build`.

## 3. Put it online (Cloudflare Pages)

The app has server routes (chat and AI calls), so it must be deployed to Cloudflare Pages through GitHub. A simple drag-and-drop of the `build` folder or a static host will show 404 errors.

1. Cloudflare dashboard > Workers & Pages > Create > Pages > Connect to Git. Choose your repository.
2. Build settings:
   - Framework preset: None
   - Build command: `pnpm run build`
   - Build output directory: `build/client`
3. Environment variables (Settings > Variables and Secrets, add as **Encrypted**):
   - `NODE_VERSION` = `20.15.1`
   - `PNPM_VERSION` = `9.4.0`
   - Your provider keys, for example `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`, `GROQ_API_KEY`, `DEEPSEEK_API_KEY`, `MISTRAL_API_KEY`, `OPEN_ROUTER_API_KEY`
4. Save and deploy. After each `git push` to `main`, Cloudflare rebuilds automatically.

If the live site still shows 404 after a deploy, check that the build output directory is exactly `build/client` and that the `functions` folder is in the repository root.

## 4. AI providers and models

Keys go in `.env.local` (local) or Cloudflare variables (online). A provider only works when its key, billing, and model access are valid.

| Provider | Key name | Example models in the list |
|---|---|---|
| Anthropic (Claude) | `ANTHROPIC_API_KEY` | Claude 3.5 Sonnet (default), Claude 3 Opus, Claude 3 Sonnet, Claude 3 Haiku |
| OpenAI (ChatGPT) | `OPENAI_API_KEY` | GPT-4o, GPT-4o Mini, GPT-4 Turbo, GPT-4, GPT-3.5 Turbo |
| Google (Gemini) | `GOOGLE_GENERATIVE_AI_API_KEY` | Gemini 1.5 Flash, Gemini 1.5 Pro |
| Groq | `GROQ_API_KEY` | Llama 3.1 70b and 8b, Llama 3.2 (1b, 3b, 11b) |
| OpenRouter | `OPEN_ROUTER_API_KEY` | Claude 3.5 Sonnet, Gemini, Qwen, Mistral Nemo, Cohere Command and others |
| DeepSeek | `DEEPSEEK_API_KEY` | DeepSeek-Chat, DeepSeek-Coder |
| Mistral | `MISTRAL_API_KEY` | Mistral 7B, 8x7B, 8x22B, Codestral, Mistral Large and others |
| Ollama (local) | `OLLAMA_API_BASE_URL` | Any model you have downloaded locally |
| OpenAI-compatible | `OPENAI_LIKE_API_BASE_URL`, `OPENAI_LIKE_API_KEY` | Any endpoint you configure |

Model names are in `app/utils/constants.ts`. Some older model names may be retired by providers over time. If a model returns an error, choose another one from the dropdown, or update the name in that file.

## 5. Troubleshooting

- Node version wrong: use Node 20.15.1 only.
- Port 3000 busy: close the other program using it, then start again.
- Local server stops right after start: read the first red error in the window. Most often a missing dependency (run the install command again) or a Node version mismatch.
- Dependencies damaged: delete `node_modules`, then run `corepack pnpm@9.4.0 install --frozen-lockfile` again.
- The page opens but AI does not reply: the provider key is missing, invalid, or has no quota.

## 6. License and attribution

Derived from an open-source Bolt.new fork. The original MIT license and upstream copyright are kept in `LICENSE`. Kodex.sbs changes are credited to Kunal Sagar. Kodex.sbs does not claim ownership of upstream code or third-party trademarks.

## 7. Render (Docker) deployment

1. On Render, create a **New > Web Service** and connect the GitHub repository.
2. Runtime: **Docker**. Render uses the `Dockerfile` in the repository root.
3. Environment variables (Render dashboard): add the provider keys you use, for example `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`, `GROQ_API_KEY`, `OPEN_ROUTER_API_KEY`, `DEEPSEEK_API_KEY`, `MISTRAL_API_KEY`. Render sets `PORT` automatically.
4. Deploy. The start script listens on `0.0.0.0` and the `PORT` Render provides.
