const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Account = require('./models/accountModel');

dotenv.config();
const app = express();
app.use(express.json());

// ===============================
// MongoDB Connection
// ===============================
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB Connection Error:', err));

// ===============================
// 1️⃣ Create Sample Accounts
// ===============================
app.post('/create-account', async (req, res) => {
  try {
    const { name, balance } = req.body;

    if (!name || balance == null || balance < 0) {
      return res.status(400).json({ success: false, message: 'Invalid account data' });
    }

    const account = await Account.create({ name, balance });
    res.status(201).json({ success: true, data: account });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ===============================
// 2️⃣ Get All Accounts
// ===============================
app.get('/accounts', async (req, res) => {
  const accounts = await Account.find();
  res.json({ success: true, data: accounts });
});

// ===============================
// 3️⃣ Transfer Money Endpoint
// ===============================
app.post('/transfer', async (req, res) => {
  try {
    const { from, to, amount } = req.body;

    // Input validation
    if (!from || !to || !amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid transfer details' });
    }

    // Fetch both accounts
    const sender = await Account.findOne({ name: from });
    const receiver = await Account.findOne({ name: to });

    // Check if both accounts exist
    if (!sender) return res.status(404).json({ success: false, message: `Sender account (${from}) not found` });
    if (!receiver) return res.status(404).json({ success: false, message: `Receiver account (${to}) not found` });

    // Validate balance
    if (sender.balance < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient balance' });
    }

    // Perform sequential updates (no transactions)
    sender.balance -= amount;
    receiver.balance += amount;

    await sender.save();
    await receiver.save();

    res.json({
      success: true,
      message: `Transfer successful: $${amount} from ${from} → ${to}`,
      from: { name: sender.name, newBalance: sender.balance },
      to: { name: receiver.name, newBalance: receiver.balance }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ===============================
// Start Server
// ===============================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
