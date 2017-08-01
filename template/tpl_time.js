module.exports = `import * as moment from 'moment-timezone';

let time = {
    /**
     * format date to Asia/Shanghai timezone string.
     * @param {string} date - date or string.
     */
    format: (date: string) => {
        return moment.tz(date, 'Asia/Shanghai').format();
    }
}

export = time;`;