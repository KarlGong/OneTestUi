class Event {
    listeners = {};

    emit(eventName, ...args) {
        if (this.listeners[eventName]) {
            this.listeners[eventName].map((func) => {
               func(...args)
            });
        }
    }

    on(eventName, func) {
        if (this.listeners[eventName]){
            this.listeners[eventName].push(func);
        } else {
            this.listeners[eventName] = [func]
        }
    }
}

export default new Event();