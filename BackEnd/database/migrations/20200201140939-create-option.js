'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Options', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      hour: {
        type: Sequelize.INTEGER
      },
      min: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      ldap: {
        type: Sequelize.BOOLEAN, 
        defaultValue: false
      },
      monitoring_rate: {
        type: Sequelize.INTEGER, 
        defaultValue: 10
      },
      burner_started: {
        type: Sequelize.BOOLEAN, 
        defaultValue: false
      },
      burner_label_path: {
        allowNull: false,
        type: Sequelize.STRING, 
        defaultValue: '',
      },
      burner_monitoring_level: {
        allowNull: false,
        type: Sequelize.STRING, 
        defaultValue: 'Study',
      },
      burner_manifacturer: {
        allowNull: false,
        type: Sequelize.STRING, 
        defaultValue: 'Epson',
      },
      burner_monitored_path: {
        allowNull: false,
        type: Sequelize.STRING, 
        defaultValue: '',
      },
      burner_delete_study_after_sent: {
        allowNull: false,
        type: Sequelize.BOOLEAN, 
        defaultValue: false,
      },
      burner_support_type : {
        allowNull: false,
        type: Sequelize.BOOLEAN, 
        defaultValue: "Auto",
      },
      burner_viewer_path: {
        allowNull: false,
        type: Sequelize.STRING, 
        defaultValue: '',
      },
      burner_transfer_syntax : {
        allowNull: false,
        type: Sequelize.STRING, 
        defaultValue: 'None',
      }

    }).then(() => {
      queryInterface.bulkInsert('Options', [{
        hour: 22,
        min: 0,
        createdAt: new Date().toDateString(),
        updatedAt: new Date().toDateString(),
        ldap: false,
      }], {})
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Options')
  }
}
