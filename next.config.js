
module.exports = {
  async redirects() {
    return [
      { source: '/ca', destination: '/in/ca', permanent: true },
      { source: '/lawyer', destination: '/in/lawyer', permanent: true },
      { source: '/india', destination: '/in', permanent: true },
    ];
  },
};
