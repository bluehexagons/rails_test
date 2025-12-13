import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api, { getErrorMessage } from '../api'
import { Button } from './Button'
import './AdminPanel.css'

interface Entity {
  id: number
  kind: string
  count: number
  created_time: string
  modified_time: string
}

interface UserStats {
  user_count: number
  entity_count: number
  recent_users: Array<{
    id: number
    username: string
    email: string
    created_at: string
    entities?: Entity[]
  }>
}

interface AdminUser {
  id: number
  username: string
  email: string | null
  admin: boolean
  created_at: string
  entities?: Entity[]
}

interface AdminUsersResponse {
  users: AdminUser[]
  meta: {
    total: number
    page: number
    per_page: number
    total_pages: number
  }
}

export function AdminPanel() {
  const [includeEntities, setIncludeEntities] = useState(true)
  const [page, setPage] = useState(1)
  const [hasLoadedUsers, setHasLoadedUsers] = useState(false)
  const [usersRefreshKey, setUsersRefreshKey] = useState(0)
  const perPage = 25

  const {
    data: stats,
    error: statsError,
    isFetching: statsFetching,
    refetch: refetchStats,
  } = useQuery<UserStats>({
    queryKey: ['admin', 'stats', includeEntities],
    queryFn: async () => {
      const response = await api.get(`/admin/stats?include_entities=${includeEntities}`)
      return response.data
    },
    enabled: false,
  })

  const {
    data: usersResp,
    error: usersError,
    isFetching: usersFetching,
  } = useQuery<AdminUsersResponse>({
    queryKey: ['admin', 'users', includeEntities, page, perPage, usersRefreshKey],
    queryFn: async () => {
      const response = await api.get(
        `/admin/users?include_entities=${includeEntities}&page=${page}&per_page=${perPage}`
      )
      return response.data
    },
    enabled: hasLoadedUsers,
    retry: false,
  })

  const handleFetch = () => {
    setPage(1)
    setHasLoadedUsers(true)
    setUsersRefreshKey((k) => k + 1)
    refetchStats()
  }

  return (
    <div className="admin-panel">
      <h3>Admin Panel</h3>

      <div className="admin-controls">
        <label>
          <input
            type="checkbox"
            checked={includeEntities}
            onChange={(e) => {
              setIncludeEntities(e.target.checked)
              setPage(1)
            }}
            className="admin-checkbox"
          />
          Fetch User Entities
        </label>
      </div>

      <div className="admin-actions">
        <Button onClick={handleFetch} variant="secondary" disabled={statsFetching}>
          {statsFetching ? 'Loading...' : 'Fetch Stats'}
        </Button>
      </div>

      {statsError && <p className="error-message">{getErrorMessage(statsError)}</p>}
      {usersError && <p className="error-message">{getErrorMessage(usersError)}</p>}

      {stats && (
        <div className="stats-display">
          <p>
            <strong>User Count:</strong> {stats.user_count}
          </p>
          <p>
            <strong>Entity Count:</strong> {stats.entity_count}
          </p>
        </div>
      )}

      <div className="admin-users">
        <div className="admin-users-header">
          <h4>All Users</h4>
          <div className="admin-pagination" role="navigation" aria-label="Users pagination">
            <Button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              variant="secondary"
              disabled={!hasLoadedUsers || usersFetching || (usersResp?.meta.page ?? 1) <= 1}
            >
              Prev
            </Button>
            <span className="admin-page-indicator">
              Page {usersResp?.meta.page ?? page} / {usersResp?.meta.total_pages ?? '--'}
            </span>
            <Button
              onClick={() => setPage((p) => p + 1)}
              variant="secondary"
              disabled={
                !hasLoadedUsers ||
                usersFetching ||
                (usersResp?.meta.total_pages != null &&
                  usersResp.meta.page >= usersResp.meta.total_pages)
              }
            >
              Next
            </Button>
          </div>
        </div>

        {!hasLoadedUsers && <p className="admin-hint">Press “Fetch Stats” to load users.</p>}
        {usersFetching && <p className="admin-loading">Loading users…</p>}
        {usersResp && (
          <>
            <p className="admin-users-meta">
              Showing {(usersResp.users?.length ?? 0)} of {usersResp.meta.total} users
            </p>
            <ul className="admin-user-list">
              {usersResp.users.map((u) => (
                <li key={u.id} className="admin-user-item">
                  <div className="admin-user-row">
                    <span className="admin-user-name">
                      {u.username}
                      {u.admin ? <span className="admin-badge">admin</span> : null}
                    </span>
                    <span className="admin-user-email">{u.email || 'No email'}</span>
                    <span className="admin-user-date">
                      {new Date(u.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {includeEntities && u.entities && u.entities.length > 0 && (
                    <ul className="entity-list">
                      {u.entities.map((e) => (
                        <li key={e.id}>
                          {e.kind}: {e.count}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}
