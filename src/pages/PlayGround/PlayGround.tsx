import { useMemo, useState, useEffect, useCallback } from 'react';
import { Layout, Model, TabNode } from 'flexlayout-react';

// IMPORTANT: Import the 'light' css instead of 'dark.css'.
// We override this in index.css to handle both light and dark mode automatically.
import 'flexlayout-react/style/light.css';

import CodeEditor from '@/components/CodeEditor/CodeEditor';
import CustomTooltip from '@/components/Tooltip';
import { Button } from '@/components/ui/button';

// Themes
import { monokai } from '@uiw/codemirror-theme-monokai';
import { githubDark, githubLight } from '@uiw/codemirror-theme-github';
import { vscodeDark, vscodeLight } from '@uiw/codemirror-theme-vscode';

// Prettier Format
import prettier from 'prettier/standalone';
import parserHtml from 'prettier/parser-html.js';
import parserBabel from 'prettier/parser-babel.js';
import parserCss from 'prettier/parser-postcss.js';

// 1. IMPORTED THE NEW ICONS HERE
import {
    LayoutGrid,
    Paintbrush,
    Wand2,
    FileCode2,
    Braces,
    MonitorPlay,
    GamepadIcon,
} from 'lucide-react';

type EditorThemes =
    | 'monokai'
    | 'github-dark'
    | 'vscode-dark'
    | 'github-light'
    | 'white-light';

function PlaygroundPage() {
    const [html, setHtml] = useState('<h1>Hello World</h1>');
    const [css, setCss] = useState('h1 { color: tomato; }');
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
                        <div className="relative w-full h-full bg-background overflow-hidden">
                            <iframe
                                title="preview"
                                sandbox="allow-scripts allow-same-origin allow-modals"
                                srcDoc={srcDoc}
                                className="absolute inset-0 w-full h-full border-0 bg-background"
                            />
                        </div>
                    );
                default:
                    return <div />;
            }
        },
        [html, css, js, srcDoc, selectedTheme]
    );

    // 2. NEW FUNCTION TO RENDER THE ICONS IN THE TABS
    const onRenderTab = (node: TabNode, renderValues: any) => {
        const tabName = node.getName();

        // We inject a React element into the 'leading' slot of the tab
        if (tabName === 'HTML') {
            renderValues.leading = (
                <FileCode2 size={16} className="mr-2 text-orange-500" />
            );
        } else if (tabName === 'CSS') {
            renderValues.leading = (
                <Paintbrush size={16} className="mr-2 text-blue-500" />
            );
        } else if (tabName === 'JS') {
            renderValues.leading = (
                <Braces size={16} className="mr-2 text-yellow-500" />
            );
        } else if (tabName === 'Preview') {
            renderValues.leading = (
                <MonitorPlay size={16} className="mr-2 text-green-500" />
            );
        }
    };

    return (
        <div className="relative w-full h-full flex flex-col bg-background text-foreground transition-colors px-10">
            {/* The IDE Toolbar */}
            <div
                id="playground-toolbar"
                className="w-full z-10 bg-background px-4 py-3 flex items-center justify-between transition-colors shadow-sm"
            >
                <div className="flex items-center gap-4">
                    <span className="font-semibold tracking-wide  text-primary text-2xl">
                        <GamepadIcon className="inline-block" size={50} />{' '}
                        Playground
                    </span>

                    {/* Theme Selector */}
                    <CustomTooltip content="Change Editor Theme" side="bottom">
                        <div className="relative flex items-center bg-background border border-border rounded-md px-3 py-1.5 focus-within:ring-1 focus-within:ring-primary transition-all">
                            <Paintbrush
                                size={14}
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
                                <option value="github-dark">GitHub Dark</option>
                                <option value="vscode-dark">VSCode Dark</option>
                                <option value="github-light">
                                    GitHub Light
                                </option>
                                <option value="white-light">White Light</option>
                            </select>
                        </div>
                    </CustomTooltip>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <CustomTooltip content="Format Active tab" side="bottom">
                        <Button
                            onClick={formatActiveTab}
                            variant="secondary"
                            size="sm"
                            className="text-sm border border-border"
                        >
                            <Wand2 size={14} className="mr-2" />
                            Format Tab
                        </Button>
                    </CustomTooltip>

                    <CustomTooltip
                        content="Reset layout to default"
                        side="bottom"
                    >
                        <Button
                            onClick={resetLayout}
                            variant="outline"
                            size="sm"
                            className="text-sm"
                        >
                            <LayoutGrid size={14} className="mr-2" />
                            Reset Layout
                        </Button>
                    </CustomTooltip>
                </div>
            </div>

            {/* The FlexLayout Area */}
            <div className="relative flex-1 w-full overflow-hidden border-e border-l rounded-xl">
                <Layout
                    model={model}
                    factory={factory}
                    onModelChange={onModelChange}
                    onRenderTab={
                        onRenderTab
                    } /* 3. PASSED THE FUNCTION TO THE LAYOUT */
                />
            </div>
        </div>
    );
}

export default function PlayGround() {
    return (
        <div className="h-screen w-full flex flex-col overflow-hidden">
            <PlaygroundPage />
        </div>
    );
}
