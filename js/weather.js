/**
 * 天气API模块
 * 获取杭州天气信息
 */

const WeatherAPI = {
    // 模拟天气数据（实际项目中可以接入真实天气API）
    mockWeatherData: {
        'sunny': { icon: '☀️', text: '晴', temp: '15-25°C' },
        'cloudy': { icon: '☁️', text: '多云', temp: '12-22°C' },
        'rainy': { icon: '🌧️', text: '小雨', temp: '10-18°C' },
        'overcast': { icon: '🌥️', text: '阴', temp: '11-20°C' },
        'partlyCloudy': { icon: '⛅', text: '晴转多云', temp: '14-24°C' }
    },

    /**
     * 获取指定日期的天气（模拟数据）
     */
    async getWeather(date) {
        // 在实际项目中，这里应该调用真实的天气API
        // 例如：和风天气、高德天气API等
        
        // 模拟：根据日期生成伪随机天气
        const dateNum = new Date(date).getDate();
        const weatherTypes = ['sunny', 'cloudy', 'rainy', 'overcast', 'partlyCloudy'];
        const weatherIndex = (dateNum + new Date(date).getMonth()) % weatherTypes.length;
        
        return this.mockWeatherData[weatherTypes[weatherIndex]];
    },

    /**
     * 获取一周的天气数据
     */
    async getWeekWeather(dates) {
        const weatherPromises = dates.map(({ dateStr }) => 
            this.getWeather(dateStr)
        );
        
        return Promise.all(weatherPromises);
    },

    /**
     * 格式化天气显示
     */
    formatWeather(weather) {
        return `${weather.icon} ${weather.text} ${weather.temp}`;
    }
};
