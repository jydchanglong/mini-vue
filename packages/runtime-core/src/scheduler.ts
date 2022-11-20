let pendingPreFlushCbs: Function[] = []
let isFlushPending = false
let currentFlushPromise: Promise<any> | null = null
const resolvedPromise = Promise.resolve() as Promise<any>

export function queuePreFlushCb(cb: Function) {
  queueCb(cb, pendingPreFlushCbs)
}

function queueCb(cb: Function, pendingQueue: Function[]) {
  pendingQueue.push(cb)
  queueFlush()
}

function queueFlush() {
  if (!isFlushPending) {
    isFlushPending = true
    currentFlushPromise = resolvedPromise.then(flushJobs)
  }
}

function flushJobs() {
  isFlushPending = false
  flushPreFlushCbs()
}

export function flushPreFlushCbs() {
  if (pendingPreFlushCbs.length) {
    let activeFlushPreCbs = [...new Set(pendingPreFlushCbs)]
    pendingPreFlushCbs.length = 0
    for (let index = 0; index < activeFlushPreCbs.length; index++) {
      activeFlushPreCbs[index]()
    }
  }
}
