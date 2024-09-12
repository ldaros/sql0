import { useEffect, useRef, useCallback, useState } from "react"
import Editor, { useMonaco } from "@monaco-editor/react"
import sqlKeywords from "@/data/sql-keywords.json"

export const SQLEditor = ({ query, setQuery, tables }: 
  { query: string, setQuery: (query: string) => void, tables: { tableName: string, columns: string[] }[]}) => {
  const monaco = useMonaco()

  const getCompletionItems = (tables: { tableName: string, columns: string[] }[]) => {
    const suggestions = [
      ...tables.flatMap(table => [
        {
          label: table.tableName,
          kind: monaco?.languages.CompletionItemKind.Class,
          insertText: table.tableName,
          detail: `Table`,
        },
        ...table.columns.map(column => ({
          label: `${table.tableName}.${column}`,
          kind: monaco?.languages.CompletionItemKind.Field,
          insertText: `${column}`,
          detail: `Column of ${table.tableName}`,
        }))
      ]),
      ...sqlKeywords.keywords.map(keyword => ({
        label: keyword,
        kind: monaco?.languages.CompletionItemKind.Keyword,
        insertText: keyword,
      })),
      ...sqlKeywords.functions.map(func => ({
        label: func,
        kind: monaco?.languages.CompletionItemKind.Function,
        insertText: func,
      })),
      ...sqlKeywords.types.map(type => ({
        label: type,
        kind: monaco?.languages.CompletionItemKind.TypeParameter,
        insertText: type,
      })),
      ...sqlKeywords.operators.map(operator => ({
        label: operator,
        kind: monaco?.languages.CompletionItemKind.Operator,
        insertText: operator,
      })),
    ];
``
    return { suggestions };
  }

  useEffect(() => {
    if (monaco) {
      const provider = monaco.languages.registerCompletionItemProvider('sql', {
        provideCompletionItems: (model, position) => {
          return getCompletionItems(tables);
        }
      });

      return () => {
        provider.dispose();
      };
    }
  }, [monaco, tables]);

  return (
    <Editor
      height="100%"
      defaultLanguage="sql"
      theme="light"
      value={query}
      onChange={(value) => setQuery(value || "")}
      options={{
        minimap: { enabled: false },
        fontSize: 16,
        wordWrap: 'on',
        padding: { top: 10, bottom: 10 },
        suggestOnTriggerCharacters: true,
      }}
      width="100%"
    />
  )
}