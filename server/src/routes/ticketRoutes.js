import express from "express";
import Ticket from "../models/Ticket.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.use(auth);

// Get tickets
router.get("/", async (req, res) => {
  try {
    let query = {};

    // Customer → only their own tickets
    if (req.user.role === "customer") {
      query = {
        createdBy: req.user._id,
      };
    }

    // Agent → all tickets
    // Admin → all tickets

    const tickets = await Ticket.find(query)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json({
      tickets,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Create ticket
router.post("/", async (req, res) => {
  try {
    const ticket = await Ticket.create({
      ...req.body,
      createdBy: req.user._id,
    });

    res.status(201).json({
      ticket,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Update ticket
router.patch("/:id", async (req, res) => {
  try {
    const ticket =
      await Ticket.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
        }
      );

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found",
      });
    }

    res.json({
      ticket,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

export default router;