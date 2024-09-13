import React, { createContext, useState, useEffect } from 'react'

export const DatabaseContext = createContext<any>(null)

export interface QueryTab {
  id: string;
  name: string;
  content: string;
}

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [tabs, setTabs] = useState<QueryTab[]>([
    { id: '1', name: 'Query 1', content: "SELECT * FROM users;" }
  ]);
  const [activeTab, setActiveTab] = useState<string>('1');
  const [queryResult, setQueryResult] = useState<any[]>([])
  const [tables, setTables] = useState<{ tableName: string, columns: string[] }[]>([])
  const [editorHeight, setEditorHeight] = useState('60%')
  const [databaseName, setDatabaseName] = useState("Database")
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTables()
  }, [])

  const getActiveTab = () => {
    return tabs.find((tab) => tab.id === activeTab)
  }

  const setActiveTabContent = (content: string) => {
    setTabs(prevTabs => prevTabs.map(tab => 
      tab.id === activeTab ? { ...tab, content: content } : tab
    ));
  }

  const getActiveTabContent = () => {
    return getActiveTab()?.content || ""
  }

  const addNewTab = () => {
    const newTabId = (parseInt(tabs[tabs.length - 1].id) + 1).toString()
    setTabs([...tabs, { id: newTabId, name: `Query ${newTabId}`, content: '' }])
    setActiveTab(newTabId)
  }

  const removeTab = (tabId: string) => {
    if (tabs.length === 1) return
    const newTabs = tabs.filter(tab => tab.id !== tabId)
    setTabs(newTabs)
    if (activeTab === tabId) {
      setActiveTab(newTabs[newTabs.length - 1].id)
    }
  }

  const fetchTables = async () => {
    try {
      const response = await fetch('/api/postgres/tables')
      if (!response.ok) {
        throw new Error('Failed to fetch tables')
      }
      const data = await response.json()
      setTables(data.tables)
      setDatabaseName(data.databaseName)
      setError(null)
    } catch (err) {
      console.error('Error fetching tables:', err)
      setError('Failed to fetch tables. Please check your database connection.')
      setTables([])
    }
  }

  const handleRunQuery = async () => {
    try {
        const query = getActiveTabContent()
        const response = await fetch('/api/postgres/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query }),
        })
        const data = await response.json()
  
        if (data.error) {
          setQueryResult([{ 
            error: `Query execution failed: ${data.error}`,
            timestamp: new Date().toISOString(),
            query: query,
            cause: data.cause
          }])
        } else {
          setQueryResult(data.result)
        }
        setError(null)
      } catch (err) {
        console.error('Error executing query:', err)
        setError('Failed to execute query. Please check your database connection.')
        setQueryResult([])
      }
  }

  const handleSaveQuery = () => {
    const query = getActiveTab()?.content
    if (!query) {
      setError("Query is empty. Please enter a query before saving.");
      return;
    }

    if (!query.trim()) {
      setError("Query is empty. Please enter a query before saving.");
      return;
    }

    const blob = new Blob([query], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = getActiveTab()?.name + ".sql"
    
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setError(null);
  }

  const handleTableAction = (tableName: string, action: string) => {
    let newQuery = "";
    switch (action) {
      case "select":
        newQuery = `SELECT * FROM ${tableName};`;
        break;
      case "update":
        newQuery = `UPDATE ${tableName}\nSET column1 = value1, column2 = value2\nWHERE condition;`;
        break;
      case "drop":
        newQuery = `DROP TABLE ${tableName};`;
        break;
      default:
        newQuery = `SELECT * FROM ${tableName};`;
    }

    const updatedContent = getActiveTabContent().trim() ? `${getActiveTabContent()}\n\n${newQuery}` : newQuery;
    setActiveTabContent(updatedContent);
    setError(null);
  }

  const value = {
    tabs,
    setTabs,
    activeTab,
    setActiveTab,
    queryResult,
    tables,
    databaseName,
    error,
    isSettingsOpen,
    setIsSettingsOpen,
    editorHeight,
    setEditorHeight,
    fetchTables,
    handleRunQuery,
    handleSaveQuery,
    handleTableAction,
    setError,
    getActiveTab,
    setActiveTabContent,
    getActiveTabContent,
    addNewTab,
    removeTab
  }

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  )
}