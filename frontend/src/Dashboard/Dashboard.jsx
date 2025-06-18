

const Dashboard = () => {
  return (
    <div>
      <Layout>
        <h1>Dashboard</h1>
        <p>Welcome to the dashboard! Here you can find various statistics and information.</p>
        <div className="dashboard-content">
          <div className="dashboard-card">      
            <h2>Card 1</h2>
            <p>Content for card 1.</p>
          </div>
          <div className="dashboard-card">
            <h2>Card 2</h2>
            <p>Content for card 2.</p>
          </div>

          <div className="dashboard-card">
            <h2>Card 3</h2>
            <p>Content for card 3.</p>
          </div>
          <div className="dashboard-card">
            <h2>Card 4</h2>
            <p>Content for card 4.</p>

          </div>
        </div>
        <style jsx>{`
          .dashboard-content {
            display: flex;    
            flex-wrap: wrap;
            gap: 20px;
            justify-content: center;
          }
          .dashboard-card {
            background-color: #f0f0f0;
            border: 1px solid #ccc;
            border-radius: 8px;
            padding: 20px;
            width: 300px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); 
            transition: transform 0.2s;
          }
          .dashboard-card:hover {
            transform: translateY(-5px);
          }
          h1 {
            text-align: center;
            margin-bottom: 20px;
          }
          h2 {
            margin-top: 0;
          }
          p {
            margin: 0;
          }
        `}</style>  
      </Layout> 
    </div>
  )
}

export default Dashboard