import axios from 'axios'

export const userRepository = {
  /**
   * Fetches the user's profile from GitLab.
   *
   * @param {string} accessToken - The access token for authorization.
   * @returns {Promise<object>} - The GitLab user profile.
   */
  async fetchUserProfile(accessToken) {
    try {
      const response = await axios.get(`${process.env.GITLAB_BASE_URL}/api/v4/user`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching user profile:', error.message)
      throw new Error('Failed to fetch user profile from GitLab.')
    }
  },

  /**
   *
   * @param accessToken
   * @param userId
   */
  async fetchUserActivities(accessToken, userId) {
    try {
      // Hämta första 100 events
      const firstResponse = await axios.get(`${process.env.GITLAB_BASE_URL}/api/v4/users/${userId}/events`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { per_page: 100, page: 1 }
      })

      // Hämta nästa 1 event (för att nå 101 totalt)
      const secondResponse = await axios.get(`${process.env.GITLAB_BASE_URL}/api/v4/users/${userId}/events`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { per_page: 1, page: 2 }
      })

      return [...firstResponse.data, ...secondResponse.data]
    } catch (error) {
      console.error('Error fetching user activities:', error.message)
      throw new Error('Failed to fetch user activities from GitLab.')
    }
  },

  /**
   * Fetches the group IDs accessible to the user from GitLab.
   *
   * @param {string} accessToken - The access token for authorization.
   * @returns {Promise<Array<number>>} - A promise that resolves to an array of group IDs.
   */
  async fetchGroups(accessToken) {
    try {
      const response = await axios.get(`${process.env.GITLAB_BASE_URL}/api/v4/groups`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        params: {
          include_subgroups: true
        }
      })

      const groupIds = response.data.map(group => group.id)
      return groupIds
    } catch (error) {
      console.error('Error fetching groups:', error.response ? error.response.data : error.message)
      throw new Error('Failed to fetch groups from GitLab.')
    }
  },
  /**
   * Fetches projects for the specified group IDs, including last commit and author avatar for each project.
   *
   * @param {string} accessToken - The access token for authorization.
   * @param {Array<number>} groupIds - An array of group IDs to fetch projects from.
   * @returns {Promise<Array<object>>} - A promise that resolves to an array of group project details.
   */
  async fetchUserProjects(accessToken, groupIds) {
    try {
      const limitedGroupIds = groupIds.slice(0, 3)
      const projects = await Promise.all(
        limitedGroupIds.map(async (groupId) => {
          // Hämta gruppinfo (per_page borttaget eftersom det inte behövs)
          const groupInfo = await axios.get(`${process.env.GITLAB_BASE_URL}/api/v4/groups/${groupId}`, {
            headers: { Authorization: `Bearer ${accessToken}` }
          })

          // Hämta projekt i gruppen inklusive undergrupper
          const projectsResponse = await axios.get(`${process.env.GITLAB_BASE_URL}/api/v4/groups/${groupId}/projects`, {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: { include_subgroups: true }
          })

          // Resten av koden oförändrad
          const projectsWithCommits = await Promise.all(
            projectsResponse.data.map(async (project) => {
              try {
                const commitsResponse = await axios.get(`${process.env.GITLAB_BASE_URL}/api/v4/projects/${project.id}/repository/commits?per_page=1`, {
                  headers: { Authorization: `Bearer ${accessToken}` }
                })

                const lastCommit = commitsResponse.data[0] || null

                let avatarUrl = null
                if (lastCommit && lastCommit.author_name) {
                  try {
                    const userResponse = await axios.get(`${process.env.GITLAB_BASE_URL}/api/v4/users?search=${lastCommit.author_name}`, {
                      headers: { Authorization: `Bearer ${accessToken}` }
                    })
                    avatarUrl = userResponse.data[0]?.avatar_url || null
                  } catch (userError) {
                    console.error('Error fetching user avatar:', userError.message)
                  }
                }

                return {
                  ...project,
                  last_commit: lastCommit ? { ...lastCommit, avatar_url: avatarUrl } : null
                }
              } catch {
                return { ...project, last_commit: null }
              }
            })
          )

          return {
            groupId,
            groupName: groupInfo.data.name,
            groupPath: groupInfo.data.full_path,
            projects: projectsWithCommits
          }
        })
      )
      return projects
    } catch (error) {
      console.error('Error fetching user projects:', error.response ? error.response.data : error.message)
      throw new Error('Failed to fetch user projects from GitLab.')
    }
  }
}
