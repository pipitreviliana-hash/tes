import restrict from './restrict.js'
import login from './login.js'
import rpm from './rpm.js'
import requires from './requires.js'
import error from './error.js'

const FLAG_TO_MIDDLEWARE = { restrict, rpm, error }

export default route => {
   let middlewares = []

   middlewares = Object.entries(FLAG_TO_MIDDLEWARE)
      .filter(([flagName]) => route[flagName])
      .map(([, middlewareFn]) => middlewareFn)

   if (route.login) {
      middlewares.push(login(route))
   }

   if (route.requires) {
      middlewares.push(route.requires)
   } else {
      middlewares.push(requires(route))
   }

   if (route.validator) {
      middlewares.push(route.validator)
   }

   return middlewares
}