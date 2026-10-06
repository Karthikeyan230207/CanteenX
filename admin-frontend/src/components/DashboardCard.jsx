function DashboardCard({ title, value, icon, description }) {
  return (
    <div className="dashboard-card">

      <div className="card-top">

        <div className="card-icon">
          {icon}
        </div>

        <span className="card-menu">•••</span>

      </div>

      <div className="card-content">
        <p>{title}</p>
        <h2>{value}</h2>
        <span>{description}</span>
      </div>

    </div>
  );
}

export default DashboardCard;