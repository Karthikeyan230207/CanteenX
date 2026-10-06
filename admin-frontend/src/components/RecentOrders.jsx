const orders = [
  {
    id: "#CAN001",
    student: "Karthi",
    items: "2 × Dosa",
    amount: "₹80",
    status: "Pending"
  },
  {
    id: "#CAN002",
    student: "Arun",
    items: "1 × Chicken Rice",
    amount: "₹80",
    status: "Preparing"
  },
  {
    id: "#CAN003",
    student: "Vijay",
    items: "2 × Veg Rice",
    amount: "₹120",
    status: "Ready"
  },
  {
    id: "#CAN004",
    student: "Rahul",
    items: "3 × Tea",
    amount: "₹45",
    status: "Completed"
  }
];

function RecentOrders() {
  return (
    <div className="recent-orders">

      <div className="section-header">
        <div>
          <h2>Recent Orders</h2>
          <p>Latest orders from students</p>
        </div>

        <button className="view-all">
          View All
        </button>
      </div>

      <div className="table-container">

        <table>

          <thead>
            <tr>
              <th>Order ID</th>
              <th>Student</th>
              <th>Items</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>

            {orders.map((order) => (
              <tr key={order.id}>

                <td className="order-id">
                  {order.id}
                </td>

                <td>{order.student}</td>

                <td>{order.items}</td>

                <td>{order.amount}</td>

                <td>
                  <span
                    className={`status ${order.status.toLowerCase()}`}
                  >
                    {order.status}
                  </span>
                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default RecentOrders;