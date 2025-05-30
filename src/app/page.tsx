'use client'

import { useState, useEffect } from 'react'
import { useEventStore } from '@/store/event-store'
import { LoginForm } from '@/components/login-form'
import { RegisterForm } from '@/components/register-form'
import { AddEventDialog } from '@/components/add-event-dialog'
import { EditEventDialog } from '@/components/edit-event-dialog'
import { EventComments } from '@/components/event-comments'
import { UserManagement } from '@/components/user-management'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useReminder } from '@/hooks/use-reminder'
import { CalendarIcon, Clock, User, Users, LogOut, Plus, Filter, Crown, Edit, MessageSquare, MoreVertical, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

export default function Home() {
	const { 
		events, 
		users, 
		currentUser, 
		isAuthenticated, 
		logout, 
		getUserById, 
		updateEventStatus,
		deleteEvent
	} = useEventStore()

	const [view, setView] = useState<'login' | 'register'>('login')
	const [showAddDialog, setShowAddDialog] = useState(false)
	const [showEditDialog, setShowEditDialog] = useState(false)
	const [showCommentsDialog, setShowCommentsDialog] = useState(false)
	const [selectedEvent, setSelectedEvent] = useState<any>(null)
	const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all')
	
	// 启用提醒系统
	useReminder()

	// 过滤事件
	const filteredEvents = events.filter(event => {
		if (statusFilter === 'all') return true
		return event.status === statusFilter
	})

	// 检查事件是否逾期
	const isOverdue = (event: any) => {
		const deadline = new Date(`${event.deadline}T${event.time}`)
		return deadline < new Date() && event.status !== 'completed'
	}

	// 格式化日期
	const formatDate = (dateString: string) => {
		const date = new Date(dateString)
		return new Intl.DateTimeFormat('zh-CN', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit'
		}).format(date)
	}

	// 状态颜色映射
	const getStatusColor = (status: string) => {
		switch (status) {
			case 'pending': return 'bg-yellow-100 text-yellow-800'
			case 'in-progress': return 'bg-blue-100 text-blue-800'
			case 'completed': return 'bg-green-100 text-green-800'
			default: return 'bg-gray-100 text-gray-800'
		}
	}

	// 状态文本映射
	const getStatusText = (status: string) => {
		switch (status) {
			case 'pending': return '待处理'
			case 'in-progress': return '进行中'
			case 'completed': return '已完成'
			default: return '未知'
		}
	}

	const handleEditEvent = (event: any) => {
		setSelectedEvent(event)
		setShowEditDialog(true)
	}

	const handleShowComments = (event: any) => {
		setSelectedEvent(event)
		setShowCommentsDialog(true)
	}

	const handleDeleteEvent = (eventId: string, eventTitle: string) => {
		if (window.confirm(`确定要删除事件"${eventTitle}"吗？此操作不可恢复。`)) {
			deleteEvent(eventId)
			toast.success('事件删除成功')
		}
	}

	if (!isAuthenticated) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
				<div className="w-full max-w-md">
					{view === 'login' ? (
						<LoginForm 
							onLoginSuccess={() => {}}
							onSwitchToRegister={() => setView('register')}
						/>
					) : (
						<RegisterForm 
							onRegisterSuccess={() => setView('login')}
							onSwitchToLogin={() => setView('login')}
						/>
					)}
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-gray-50">
			{/* 头部 */}
			<div className="bg-white shadow-sm">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center py-4">
						<div>
							<h1 className="text-2xl font-bold text-gray-900">芜湖市微聚贸易有限公司</h1>
							<p className="text-gray-600">日常看板</p>
						</div>
						<div className="flex items-center space-x-4">
							<div className="flex items-center space-x-2">
								{currentUser?.role === 'admin' && (
									<Crown className="w-4 h-4 text-yellow-500" />
								)}
								<User className="w-4 h-4" />
								<span className="font-medium">{currentUser?.name}</span>
							</div>
							<Button variant="outline" onClick={logout}>
								<LogOut className="w-4 h-4 mr-2" />
								退出登录
							</Button>
						</div>
					</div>
				</div>
			</div>

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<Tabs defaultValue="events" className="space-y-6">
					<TabsList>
						<TabsTrigger value="events">事件管理</TabsTrigger>
						{currentUser?.role === 'admin' && (
							<TabsTrigger value="users">
								<Users className="w-4 h-4 mr-2" />
								用户管理
							</TabsTrigger>
						)}
					</TabsList>

					<TabsContent value="events" className="space-y-6">
						{/* 事件管理工具栏 */}
						<div className="flex justify-between items-center">
							<div className="flex items-center space-x-4">
								<h2 className="text-lg font-semibold">事件列表</h2>
								<div className="flex items-center space-x-2">
									<Filter className="w-4 h-4" />
									<select 
										value={statusFilter}
										onChange={(e) => setStatusFilter(e.target.value as any)}
										className="text-sm border rounded px-2 py-1"
									>
										<option value="all">全部</option>
										<option value="pending">待处理</option>
										<option value="in-progress">进行中</option>
										<option value="completed">已完成</option>
									</select>
								</div>
							</div>
							<Button onClick={() => setShowAddDialog(true)}>
								<Plus className="w-4 h-4 mr-2" />
								添加事件
							</Button>
						</div>

						{/* 事件卡片网格 */}
						<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
							{filteredEvents.map(event => {
								const assignedUser = getUserById(event.assignedUserId)
								const overdue = isOverdue(event)
								
								return (
									<Card key={event.id} className={`relative ${overdue ? 'border-red-200 bg-red-50' : ''}`}>
										<CardHeader>
											<div className="flex justify-between items-start">
												<div className="flex-1">
													<CardTitle className={`text-lg ${overdue ? 'text-red-700' : ''}`}>
														{event.title}
													</CardTitle>
													<CardDescription className="mt-1">
														{event.description}
													</CardDescription>
												</div>
												
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant="ghost" size="sm">
															<MoreVertical className="w-4 h-4" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuItem onClick={() => handleEditEvent(event)}>
															<Edit className="w-4 h-4 mr-2" />
															编辑事件
														</DropdownMenuItem>
														<DropdownMenuItem onClick={() => handleShowComments(event)}>
															<MessageSquare className="w-4 h-4 mr-2" />
															查看评论
														</DropdownMenuItem>
														<DropdownMenuSeparator />
														<DropdownMenuItem 
															onClick={() => handleDeleteEvent(event.id, event.title)}
															className="text-red-600"
														>
															<Trash2 className="w-4 h-4 mr-2" />
															删除事件
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</div>
										</CardHeader>
										
										<CardContent>
											<div className="space-y-4">
												<div className="flex justify-between items-center">
													<Badge 
														className={getStatusColor(event.status)}
														onClick={() => {
															const statuses: Array<'pending' | 'in-progress' | 'completed'> = ['pending', 'in-progress', 'completed']
															const currentIndex = statuses.indexOf(event.status)
															const nextStatus = statuses[(currentIndex + 1) % statuses.length]
															if (nextStatus) {
																updateEventStatus(event.id, nextStatus)
																toast.success(`状态已更新为：${getStatusText(nextStatus)}`)
															}
														}}
													>
														{getStatusText(event.status)}
													</Badge>
													{overdue && (
														<Badge variant="destructive" className="text-xs">
															已逾期
														</Badge>
													)}
												</div>
												
												<div className="flex items-center space-x-2 text-sm text-gray-600">
													<CalendarIcon className="w-4 h-4" />
													<span>{formatDate(event.deadline)}</span>
													<Clock className="w-4 h-4 ml-2" />
													<span>{event.time}</span>
												</div>
												
												<div className="flex items-center space-x-2 text-sm text-gray-600">
													<User className="w-4 h-4" />
													<span>负责人: {assignedUser?.name || '未指定'}</span>
												</div>
												
												{event.reminderEnabled && (
													<div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
														提醒间隔: {event.reminderInterval} 分钟
													</div>
												)}

												<div className="flex justify-between items-center pt-2">
													<Button
														variant="outline"
														size="sm"
														onClick={() => handleShowComments(event)}
													>
														<MessageSquare className="w-4 h-4 mr-2" />
														评论
													</Button>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handleEditEvent(event)}
													>
														<Edit className="w-4 h-4 mr-2" />
														编辑
													</Button>
												</div>
											</div>
										</CardContent>
									</Card>
								)
							})}
						</div>

						{filteredEvents.length === 0 && (
							<div className="text-center py-12">
								<CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
								<h3 className="text-lg font-medium text-gray-900 mb-2">暂无事件</h3>
								<p className="text-gray-600 mb-4">
									{statusFilter === 'all' ? '还没有创建任何事件' : `暂无${getStatusText(statusFilter)}的事件`}
								</p>
								<Button onClick={() => setShowAddDialog(true)}>
									<Plus className="w-4 h-4 mr-2" />
									创建第一个事件
								</Button>
							</div>
						)}
					</TabsContent>

					{currentUser?.role === 'admin' && (
						<TabsContent value="users">
							<UserManagement />
						</TabsContent>
					)}
				</Tabs>
			</div>

			{/* 对话框 */}
			<AddEventDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
			
			<EditEventDialog 
				open={showEditDialog} 
				onOpenChange={setShowEditDialog}
				event={selectedEvent}
			/>

			<Dialog open={showCommentsDialog} onOpenChange={setShowCommentsDialog}>
				<DialogContent className="sm:max-w-[500px]">
					<DialogHeader>
						<DialogTitle>
							{selectedEvent?.title} - 评论
						</DialogTitle>
					</DialogHeader>
					{selectedEvent && (
						<EventComments eventId={selectedEvent.id} />
					)}
				</DialogContent>
			</Dialog>
		</div>
	)
}
