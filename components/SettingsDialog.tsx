import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"

interface ConnectionConfig {
  host: string;
  port: string;
  username: string;
  password: string;
  database: string;
}

interface SettingsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  setError: (error: string | null) => void;
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({
  isOpen,
  onOpenChange,
  setError
}) => {
  const [connectionConfig, setConnectionConfig] = useState<ConnectionConfig>({
    host: "",
    port: "",
    username: "",
    password: "",
    database: ""
  })

  const fetchDatabaseSettings = async () => {
    try {
      const response = await fetch('/api/postgres/settings')
      if (!response.ok) {
        throw new Error('Failed to fetch database settings')
      }
      const data = await response.json()
      setConnectionConfig({
        host: data.host || "",
        port: data.port ? data.port.toString() : "",
        username: data.user || "",
        password: data.password || "",
        database: data.database || ""
      })
      setError(null)
    } catch (err) {
      console.error('Error fetching database settings:', err)
      setError('Failed to fetch database settings. Please check your database connection.')
    }
  }

  const handleSettingsSave = async () => {
    try {
      const response = await fetch('/api/postgres/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(connectionConfig),
      })
      if (response.ok) {
        onOpenChange(false)
      } else {
        throw new Error('Failed to save connection settings')
      }
    } catch (err) {
      console.error('Error saving connection settings:', err)
      setError('Failed to save connection settings. Please try again.')
    }
  }

  useEffect(() => {
    fetchDatabaseSettings()
  }, [])

  const handleInputChange = (field: keyof ConnectionConfig) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setConnectionConfig(prev => ({ ...prev, [field]: e.target.value }))
  }

  const renderInputField = (field: keyof ConnectionConfig, label: string, type: string = "text") => (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor={field} className="text-right">
        {label}
      </Label>
      <Input
        id={field}
        type={type}
        value={connectionConfig[field]}
        onChange={handleInputChange(field)}
        className="col-span-3"
      />
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Database Connection Settings</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {renderInputField("host", "Host")}
          {renderInputField("port", "Port")}
          {renderInputField("username", "Username")}
          {renderInputField("password", "Password", "password")}
          {renderInputField("database", "Database")}
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSettingsSave}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}