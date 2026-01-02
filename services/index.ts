import postsAuth from './posts.service.js'


const bind = (route, config) => {
  postsAuth(route, config)
}

export default bind
