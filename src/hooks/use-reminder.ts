import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { useEventStore } from '@/store/event-store'

export function useReminder() {
  const { events, getUserById } = useEventStore()
  const intervalRef = useRef<any>(null)

  useEffect(() => {
    // 清除之前的定时器
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    // 每分钟检查一次需要提醒的事件
    intervalRef.current = setInterval(() => {
      const now = new Date()
      
      events.forEach((event: any) => {
        if (!event.reminderEnabled || event.status === 'completed') {
          return
        }

        const deadline = new Date(event.deadline + 'T' + event.time)
        const timeDiff = deadline.getTime() - now.getTime()
        const minutesDiff = Math.floor(timeDiff / (1000 * 60))

        // 如果距离截止时间不到提醒间隔的时间，发送提醒
        if (minutesDiff <= event.reminderInterval && minutesDiff >= 0) {
          const user = getUserById(event.assignedUserId)
          const userName = user ? user.name : '未知用户'
          
          toast.warning(`事件提醒`, {
            description: `${event.title} - 分配给: ${userName}，距离截止时间还有 ${minutesDiff} 分钟`,
            duration: 5000,
          })
        }

        // 如果已过期且状态不是完成，发送过期提醒
        if (timeDiff < 0 && event.status !== 'completed') {
          const user = getUserById(event.assignedUserId)
          const userName = user ? user.name : '未知用户'
          
          toast.error(`事件已过期`, {
            description: `${event.title} - 分配给: ${userName}，已过期`,
            duration: 5000,
          })
        }
      })
    }, 60000) // 每分钟检查一次

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [events, getUserById])

  return null
} 