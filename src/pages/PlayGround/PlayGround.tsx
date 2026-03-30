import { useMemo, useState, useEffect, useCallback } from 'react';
import { Layout, Model, TabNode } from 'flexlayout-react';
import 'flexlayout-react/style/dark.css';

import CodeEditor from '@/components/CodeEditor/CodeEditor';
import CustomTooltip from '@/components/Tooltip';

// Themes
import { monokai } from '@uiw/codemirror-theme-monokai';
import { githubDark, githubLight } from '@uiw/codemirror-theme-github';
import { vscodeDark, vscodeLight } from '@uiw/codemirror-theme-vscode';

// Prettier Format
import prettier from 'prettier/standalone';
import parserHtml from 'prettier/parser-html.js';
import parserBabel from 'prettier/parser-babel.js';
import parserCss from 'prettier/parser-postcss.js';
import { Button } from '@/components/ui/button';

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

    const [navbarHeight, setNavbarHeight] = useState(80);
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

    // Dynamic Navbar Height Measurement
    useEffect(() => {
        const nav = document.getElementById('navbar');
        if (nav) {
            setNavbarHeight(nav.offsetHeight);
        }
    }, []);

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
        typeof window !== 'undefined' ? localStorage.getItem('layout') : null;

    const [model, setModel] = useState(() =>
        Model.fromJson(saved ? JSON.parse(saved) : defaultJson)
    );

    const onModelChange = useCallback((m: any) => {
        localStorage.setItem('layout', JSON.stringify(m.toJson()));
    }, []);

    const resetLayout = () => {
        localStorage.removeItem('layout');
        setModel(Model.fromJson(defaultJson));
    };

    // Format current tab (HTML/CSS/JS)
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
                        <iframe
                            title="preview"
                            sandbox="allow-scripts"
                            srcDoc={srcDoc}
                            style={{ width: '100%', height: '100%', border: 0 }}
                        />
                    );
                default:
                    return <div />;
            }
        },
        [html, css, js, srcDoc, selectedTheme]
    );

    return (
        <div style={{ position: 'relative' }}>
            <div
                id="navbar"
                style={{
                    width: '100%',
                    top: 0,
                    left: 0,
                    zIndex: 100,
                    background: '#0f0f0f',
                    borderBottom: '1px solid #333',
                    padding: '14px 24px',
                    display: 'flex',
                    gap: '12px',
                }}
            >
                <div style={{ display: 'flex', gap: '12px' }}>
                    <CustomTooltip content="Change Editor Theme">
                        <div style={{ position: 'relative', zIndex: 1000 }}>
                            <select
                                value={selectedTheme}
                                onChange={e =>
                                    setSelectedTheme(
                                        e.target.value as EditorThemes
                                    )
                                }
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    background: '#1e1e1e',
                                    color: '#fff',
                                    width: '150px',
                                    height: '40px',
                                    border: '1px solid #444',
                                    position: 'relative',
                                }}
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
                <CustomTooltip content="Format Active tab">
                    <Button onClick={formatActiveTab}>Format Tab</Button>
                </CustomTooltip>

                <CustomTooltip content="Reset layout to default">
                    <button
                        onClick={resetLayout}
                        style={{
                            padding: '6px 14px',
                            background: '#222',
                            color: '#fff',
                            borderRadius: '5px',
                            border: '1px solid #444',
                            cursor: 'pointer',
                        }}
                    >
                        Reset Layout
                    </button>
                </CustomTooltip>
            </div>

            <div
                style={{
                    position: 'relative',
                    flex: 1,
                    paddingTop: navbarHeight,
                    height: `calc(100vh - ${navbarHeight}px)`,
                    boxSizing: 'border-box',
                    zIndex: 1,
                }}
            >
                <Layout
                    model={model}
                    factory={factory}
                    onModelChange={onModelChange}
                />
            </div>
        </div>
    );
}

export default function PlayGround() {
    return (
        <div className="h-[100vh] relative">
            <PlaygroundPage />
        </div>
    );
}
