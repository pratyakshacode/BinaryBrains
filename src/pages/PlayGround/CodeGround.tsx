import { useMemo, useState, useEffect, useCallback } from 'react';
import { Layout, Model, TabNode } from 'flexlayout-react';

// IMPORTANT: Import the 'light' css instead of 'dark.css'.
// We override this in index.css to handle both light and dark mode automatically.
import 'flexlayout-react/style/light.css';

import CodeEditor from '@/components/CodeEditor/CodeEditor';
import CustomTooltip from '@/components/Tooltip';
import { Button } from '@/components/ui/button';
import { Breadcrumb } from '@/components/ui/BreadCrumb/BreadCrumb';

// Themes
import { monokai } from '@uiw/codemirror-theme-monokai';
import { githubDark, githubLight } from '@uiw/codemirror-theme-github';
import { vscodeDark, vscodeLight } from '@uiw/codemirror-theme-vscode';

// Prettier Format
import prettier from 'prettier/standalone';
import parserHtml from 'prettier/parser-html.js';
import parserBabel from 'prettier/parser-babel.js';
import parserCss from 'prettier/parser-postcss.js';

import {
    LayoutGrid,
    Paintbrush,
    Wand2,
    FileCode2,
    Braces,
    MonitorPlay,
    TerminalSquare, // 🔥 Using Terminal instead of Gamepad for the IDE
    Code2,
} from 'lucide-react';

type EditorThemes =
    | 'monokai'
    | 'github-dark'
    | 'vscode-dark'
    | 'github-light'
    | 'white-light';

export default function CodeGround() {
    const [html, setHtml] = useState('<h1>Say hello to Playground</h1>');
    const [css, setCss] = useState('h1 { color: teal; }');
    const [js, setJs] = useState("console.log('Hello from JS');");
    const [srcDoc, setSrcDoc] = useState('');

    const [selectedTheme, setSelectedTheme] = useState<EditorThemes>('monokai');

    const getTheme = (theme: EditorThemes) => {
        switch (theme) {
            case 'monokai':
                return monokai;
            case 'github-dark':
                return githubDark;
            case 'vscode-dark':
                return vscodeDark;
            case 'github-light':
                return githubLight;
            case 'white-light':
                return vscodeLight;
            default:
                return vscodeDark;
        }
    };

    // Live Preview
    useEffect(() => {
        const timeout = setTimeout(() => {
            setSrcDoc(`
        <html>
          <head><style>${css}</style></head>
          <body>
            ${html}
            <script>
              try { ${js} } catch(e) {
                document.body.innerHTML += '<pre style="color:red">' + e + '</pre>';
              }
            </script>
          </body>
        </html>
      `);
        }, 300);

        return () => clearTimeout(timeout);
    }, [html, css, js]);

    // FlexLayout Model
    const defaultJson = useMemo(
        () => ({
            global: { splitterSize: 6, enableClose: false },
            layout: {
                type: 'row',
                children: [
                    {
                        type: 'tabset',
                        weight: 0.6,
                        children: [
                            {
                                type: 'tab',
                                name: 'HTML',
                                component: 'htmlEditor',
                            },
                            {
                                type: 'tab',
                                name: 'CSS',
                                component: 'cssEditor',
                            },
                            { type: 'tab', name: 'JS', component: 'jsEditor' },
                        ],
                    },
                    {
                        type: 'tabset',
                        weight: 0.4,
                        children: [
                            {
                                type: 'tab',
                                name: 'Preview',
                                component: 'preview',
                            },
                        ],
                    },
                ],
            },
        }),
        []
    );

    const saved =
        typeof window !== 'undefined'
            ? localStorage.getItem('playground-layout')
            : null;

    const [model, setModel] = useState(() =>
        Model.fromJson(saved ? JSON.parse(saved) : defaultJson)
    );

    const onModelChange = useCallback((m: any) => {
        localStorage.setItem('playground-layout', JSON.stringify(m.toJson()));
    }, []);

    const resetLayout = () => {
        localStorage.removeItem('playground-layout');
        setModel(Model.fromJson(defaultJson));
    };

    // Format current tab
    const formatActiveTab = () => {
        const activeNode = model.getActiveTabset()?.getSelectedNode();
        if (!activeNode || !(activeNode instanceof TabNode)) return;

        const tabName = activeNode.getName();
        let code = '';
        let setCode: (value: string) => void = () => {};
        let parser = 'babel';

        if (tabName === 'HTML') {
            code = html;
            setCode = setHtml;
            parser = 'html';
        } else if (tabName === 'CSS') {
            code = css;
            setCode = setCss;
            parser = 'css';
        } else if (tabName === 'JS') {
            code = js;
            setCode = setJs;
            parser = 'babel';
        } else return;

        try {
            const formatted = prettier.format(code, {
                parser,
                plugins: [parserHtml, parserBabel, parserCss],
                tabWidth: 2,
                semi: true,
            });
            setCode(formatted);
        } catch (err) {
            console.error('Format error:', err);
        }
    };

    // Editor Factory
    const factory = useCallback(
        (node: any) => {
            const comp = node.getComponent();
            const themeObject = getTheme(selectedTheme);

            switch (comp) {
                case 'htmlEditor':
                    return (
                        <CodeEditor
                            value={html}
                            onChange={setHtml}
                            language="html"
                            theme={themeObject}
                        />
                    );
                case 'cssEditor':
                    return (
                        <CodeEditor
                            value={css}
                            onChange={setCss}
                            language="css"
                            theme={themeObject}
                        />
                    );
                case 'jsEditor':
                    return (
                        <CodeEditor
                            value={js}
                            onChange={setJs}
                            language="javascript"
                            theme={themeObject}
                        />
                    );
                case 'preview':
                    return (
                        <div className="relative w-full h-full bg-white dark:bg-background overflow-hidden">
                            <iframe
                                title="preview"
                                sandbox="allow-scripts allow-same-origin allow-modals"
                                srcDoc={srcDoc}
                                className="absolute inset-0 w-full h-full border-0 bg-transparent"
                            />
                        </div>
                    );
                default:
                    return <div />;
            }
        },
        [html, css, js, srcDoc, selectedTheme]
    );

    // Tab Icon Renderer
    const onRenderTab = (node: TabNode, renderValues: any) => {
        const tabName = node.getName();
        if (tabName === 'HTML')
            renderValues.leading = (
                <FileCode2 size={16} className="mr-2 text-orange-500" />
            );
        else if (tabName === 'CSS')
            renderValues.leading = (
                <Paintbrush size={16} className="mr-2 text-blue-500" />
            );
        else if (tabName === 'JS')
            renderValues.leading = (
                <Braces size={16} className="mr-2 text-yellow-500" />
            );
        else if (tabName === 'Preview')
            renderValues.leading = (
                <MonitorPlay size={16} className="mr-2 text-green-500" />
            );
    };

    return (
        <div className="relative w-full h-screen flex flex-col bg-background text-foreground overflow-hidden max-w-7xl items-center justify-center mx-auto">
            {/* Ambient Background Glows */}
            <div className="fixed top-20 left-10 w-[500px] h-[500px] bg-primary/30 blur-[150px] rounded-full pointer-events-none"></div>
            <div className="fixed bottom-10 right-10 w-[400px] h-[400px] bg-primary/40 blur-[150px] rounded-full pointer-events-none"></div>

            <div className="relative z-10 flex flex-col h-full w-full p-4 sm:p-6 gap-6 max-w-7xl">
                {/* 🔥 Breadcrumb */}
                <div className="shrink-0">
                    <Breadcrumb
                        items={[
                            { title: 'Home', url: '/' },
                            { title: 'Playground', url: '/playground' },
                            { title: 'Code Sandbox', url: '#' },
                        ]}
                        className="mb-0" // Overriding default margin since we use gap
                    />
                </div>

                {/* 🔥 Glassmorphic Toolbar */}
                <div
                    id="playground-toolbar"
                    className="shrink-0 w-full bg-card/60 backdrop-blur-xl border border-border shadow-sm rounded-2xl py-3 px-5 flex flex-wrap items-center justify-between gap-4 transition-colors"
                >
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center shadow-inner">
                                <TerminalSquare size={20} />
                            </div>
                            <div>
                                <h1 className="font-bold tracking-wide text-foreground text-lg leading-none">
                                    Code Sandbox
                                </h1>
                                <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                    <Code2 size={12} /> Live Preview Environment
                                </span>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="hidden sm:block w-px h-8 bg-border"></div>

                        {/* Theme Selector */}
                        <CustomTooltip
                            content="Change Editor Theme"
                            side="bottom"
                        >
                            <div className="relative flex items-center bg-background border border-border rounded-lg px-3 py-2 hover:border-primary/50 focus-within:ring-1 focus-within:ring-primary transition-all shadow-sm">
                                <Paintbrush
                                    size={16}
                                    className="text-muted-foreground mr-2"
                                />
                                <select
                                    value={selectedTheme}
                                    onChange={e =>
                                        setSelectedTheme(
                                            e.target.value as EditorThemes
                                        )
                                    }
                                    className="bg-transparent text-sm font-medium text-foreground outline-none cursor-pointer appearance-none pr-4"
                                >
                                    <option value="monokai">Monokai</option>
                                    <option value="github-dark">
                                        GitHub Dark
                                    </option>
                                    <option value="vscode-dark">
                                        VSCode Dark
                                    </option>
                                    <option value="github-light">
                                        GitHub Light
                                    </option>
                                    <option value="white-light">
                                        White Light
                                    </option>
                                </select>
                            </div>
                        </CustomTooltip>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        <CustomTooltip
                            content="Format active tab using Prettier"
                            side="bottom"
                        >
                            <Button
                                onClick={formatActiveTab}
                                variant="secondary"
                                size="sm"
                                className="text-sm shadow-sm hover:shadow-md transition-all"
                            >
                                <Wand2
                                    size={16}
                                    className="mr-2 text-blue-500"
                                />
                                Format Code
                            </Button>
                        </CustomTooltip>

                        <CustomTooltip
                            content="Reset layout to default splits"
                            side="bottom"
                        >
                            <Button
                                onClick={resetLayout}
                                variant="outline"
                                size="sm"
                                className="text-sm shadow-sm hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all"
                            >
                                <LayoutGrid size={16} className="mr-2" />
                                Reset Layout
                            </Button>
                        </CustomTooltip>
                    </div>
                </div>

                {/* 🔥 Glassmorphic FlexLayout Container */}
                <div className="flex-1 w-full bg-card/40 backdrop-blur-sm border border-border shadow-xl rounded-2xl overflow-hidden relative group">
                    {/* Subtle inner ring for depth */}
                    <div className="absolute inset-0 rounded-2xl ring-1 ring-white/5 pointer-events-none z-50"></div>

                    <Layout
                        model={model}
                        factory={factory}
                        onModelChange={onModelChange}
                        onRenderTab={onRenderTab}
                    />
                </div>
            </div>
        </div>
    );
}
