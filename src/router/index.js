import { createRouter, createWebHashHistory } from 'vue-router'
import TeamBP from '../pages/TeamBP.vue'
import CreateMatch from '../pages/CreateMatch.vue'
import MatchHistory from '../pages/MatchHistory.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      redirect: '/match'
    },
    {
      path: '/match',
      name: 'Match',
      component: TeamBP,
      meta: {
        title: '比赛'
      }
    },
    {
      path: '/match/create',
      name: 'CreateMatch',
      component: CreateMatch,
      meta: {
        title: '新建比赛'
      }
    },
    {
      path: '/match/history',
      name: 'MatchHistory',
      component: MatchHistory,
      meta: {
        title: '历史记录'
      }
    }
  ]
})

export default router 