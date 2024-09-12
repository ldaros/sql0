"use client"

import { useState, useEffect, useRef } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Play, Save, Database, GripHorizontal, RefreshCw, Settings, X, Plus } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { SettingsDialog } from "./SettingsDialog"
import { QueryResultTable } from "./QueryResultTable"
import { SQLEditor } from "./SQLEditor"
import { IconButton } from "./IconButton"
import { SidebarTableItem } from "./SidebarTable"
import { ActionButton } from "./ActionButton"
import { DatabaseProvider } from '../contexts/DatabaseContext'
import { useDatabaseContext } from '../hooks/useDatabaseContext'
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "./ui/button"

export function PostgresClient() {
  return (
    <DatabaseProvider>
      <PostgresClientContent />
    </DatabaseProvider>
  )
}

function PostgresClientContent() {
  const {
    tabs,
    activeTab,
    setActiveTab,
    getActiveTabContent,
    setActiveTabContent,
    queryResult,
    tables,
    databaseName,
    isSettingsOpen,
    setIsSettingsOpen,
    editorHeight,
    setEditorHeight,
    fetchTables,
    handleRunQuery,
    handleSaveQuery,
    handleTableAction,
    error,
    setError,
    addNewTab,
    removeTab
  } = useDatabaseContext()

  const dividerRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchTables()
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (dividerRef.current && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect()
        const newEditorHeight = e.clientY - containerRect.top
        const editorPercentage = (newEditorHeight / containerRect.height) * 100
        setEditorHeight(`${Math.max(10, Math.min(editorPercentage, 90))}%`)
      }
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    const handleMouseDown = () => {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    dividerRef.current?.addEventListener('mousedown', handleMouseDown)

    return () => {
      dividerRef.current?.removeEventListener('mousedown', handleMouseDown)
    }
  }, [])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="relative w-full max-w-6xl h-[50rem] flex bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Left sidebar with tables */}
        <div className="w-64 bg-gray-50 border-r">
          <div className="pl-4 py-2 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-700 flex items-center">
              <Database className="w-5 h-5 mr-2" />
              {databaseName || "Loading..."}
            </h2>
            <div className="flex">
              <IconButton 
                icon={<RefreshCw id="refresh-icon" />} 
                onClick={() => {
                  const icon = document.querySelector('#refresh-icon');
                  if (icon) {
                    icon.classList.add('animate-spin');
                    fetchTables().finally(() => {
                      icon.classList.remove('animate-spin');
                    });
                  }
                }} 
              />
              <IconButton icon={<Settings />} onClick={() => setIsSettingsOpen(true)} />
            </div>
          </div>
          <ScrollArea className="h-full">
            <ul className="px-2">
              {tables.map((table: { tableName: string, columns: string[] }) => (
                <SidebarTableItem key={table.tableName} table={table} handleTableAction={handleTableAction} />
              ))}
            </ul>
          </ScrollArea>
        </div>

        {/* Right side with editor and result table */}
        <div className="flex-1 flex flex-col" ref={containerRef}>

          {/* Tabs and Action Buttons */}
          <div className="flex items-center justify-between border-b p-2">
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
              <TabsList className="bg-gray-100">
                {tabs.map((tab: { id: string; name: string }) => (
                  <TabsTrigger 
                    key={tab.id} 
                    value={tab.id} 
                    className="flex items-center data-[state=active]:bg-white"
                  >
                    {tab.name}
                    {tabs.length > 1 && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="ml-2 h-4 w-4"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          removeTab(tab.id);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {/* Action icons */}
            <div className="flex space-x-2 ml-2">
              <ActionButton 
                icon={<Plus  />}
                onClick={addNewTab}
                className="text-black"
              />
              <ActionButton
                  icon={<Play />}
                  onClick={handleRunQuery}
                  className="bg-green-500 hover:bg-green-600 text-white"
                />
                <ActionButton
                  icon={<Save />}
                  onClick={handleSaveQuery}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                />
            </div>
          </div>

          {/* SQL Editor */}
          <div className="relative" style={{ height: editorHeight }}>
            <SQLEditor 
              query={getActiveTabContent()}
              setQuery={setActiveTabContent}
              tables={tables}
            />
          </div>

          {/* Resizable divider */}
          <div
            ref={dividerRef}
            className="h-1 bg-gray-200 cursor-row-resize flex items-center justify-center hover:bg-gray-300"
            aria-hidden="true"
          >
            <GripHorizontal className="w-4 h-4 text-gray-400" />
          </div>

          {/* Query Result Table */}
          <div style={{ height: `calc(100% - ${editorHeight} - 4px)` }} className="bg-white border-t border-gray-200 overflow-hidden">
            <QueryResultTable queryResult={queryResult} />
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="absolute bottom-4 left-4 max-w-md">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>

      <SettingsDialog
        isOpen={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        setError={setError}
      />
    </div>
  )
}