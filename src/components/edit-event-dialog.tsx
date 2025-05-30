'use client'

import { useState, useEffect } from 'react'
import { useEventStore, type Event } from '@/store/event-store'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'

interface EditEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: Event | null
}

export function EditEventDialog({ open, onOpenChange, event }: EditEventDialogProps) {
  const { users, updateEvent } = useEventStore()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    time: '',
    status: 'pending' as 'pending' | 'in-progress' | 'completed',
    assignedUserId: '',
    reminderEnabled: true,
    reminderInterval: 30
  })

  // 当事件数据变化时更新表单
  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description,
        deadline: event.deadline,
        time: event.time,
        status: event.status,
        assignedUserId: event.assignedUserId,
        reminderEnabled: event.reminderEnabled,
        reminderInterval: event.reminderInterval
      })
    }
  }, [event])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!event) return
    
    if (!formData.title.trim()) {
      toast.error('请输入事件标题')
      return
    }
    
    if (!formData.deadline) {
      toast.error('请选择截止日期')
      return
    }
    
    if (!formData.time) {
      toast.error('请选择截止时间')
      return
    }
    
    if (!formData.assignedUserId) {
      toast.error('请选择负责人')
      return
    }

    try {
      await updateEvent(event.id, {
        title: formData.title,
        description: formData.description,
        deadline: formData.deadline,
        time: formData.time,
        status: formData.status,
        assignedUserId: formData.assignedUserId,
        reminderEnabled: formData.reminderEnabled,
        reminderInterval: formData.reminderInterval
      })

      toast.success('事件更新成功')
      onOpenChange(false)
    } catch (error) {
      toast.error('更新失败，请重试')
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  if (!event) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>编辑事件</DialogTitle>
          <DialogDescription>
            修改事件的详细信息。
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="edit-title">事件标题*</Label>
            <Input
              id="edit-title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="输入事件标题"
            />
          </div>

          <div>
            <Label htmlFor="edit-description">事件描述</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="输入事件描述"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-deadline">截止日期*</Label>
              <Input
                id="edit-deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="edit-time">截止时间*</Label>
              <Input
                id="edit-time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label>负责人*</Label>
            <Select
              value={formData.assignedUserId}
              onValueChange={(value) => setFormData(prev => ({ ...prev, assignedUserId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择负责人" />
              </SelectTrigger>
              <SelectContent>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>事件状态</Label>
            <Select
              value={formData.status}
              onValueChange={(value: 'pending' | 'in-progress' | 'completed') => 
                setFormData(prev => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">待处理</SelectItem>
                <SelectItem value="in-progress">进行中</SelectItem>
                <SelectItem value="completed">已完成</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="edit-reminder">启用提醒</Label>
            <Switch
              id="edit-reminder"
              checked={formData.reminderEnabled}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, reminderEnabled: checked }))
              }
            />
          </div>

          {formData.reminderEnabled && (
            <div>
              <Label htmlFor="edit-reminderInterval">提醒间隔（分钟）</Label>
              <Input
                id="edit-reminderInterval"
                type="number"
                min="1"
                max="1440"
                value={formData.reminderInterval}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  reminderInterval: parseInt(e.target.value) || 30 
                }))}
              />
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              取消
            </Button>
            <Button type="submit">
              保存修改
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 