module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps : [

    // Top Crypto Charts
    {
      name      : 'Top Crypto Charts',
      script    : 'topcryptocharts.js',
      env: {
        COMMON_VARIABLE: 'true'
      },
      env_production : {
        NODE_ENV: 'production'
      },
      env_webhook: {
        port: 27777
,
        path: "/webhook",
        secret: "djdk3esdn3023dsdsds2sdsom2",
        action: "pullAndReload"
        //pre_hook: "npm run stop",
        //post_hook: "npm run generate_docs"
      }
    }
  ]
};
