export const mockListings = [
    {
        id: "L001", cropName: "Tomato", farmerName: "Ram Singh", farmerId: "F1",
        quantity: 500, unit: "kg", pricePerUnit: 32, qualityGrade: "A",
        location: "Nashik, Maharashtra", distance: 12, harvestDate: "2026-02-10",
        deliveryEstimate: "Same day", image: "", category: "Vegetables",
    },
    {
        id: "L002", cropName: "Onion", farmerName: "Suresh Patil", farmerId: "F2",
        quantity: 1000, unit: "kg", pricePerUnit: 25, qualityGrade: "A",
        location: "Lasalgaon, Maharashtra", distance: 45, harvestDate: "2026-02-08",
        deliveryEstimate: "1 day", image: "", category: "Vegetables",
    },
    {
        id: "L003", cropName: "Potato", farmerName: "Hari Prasad", farmerId: "F3",
        quantity: 800, unit: "kg", pricePerUnit: 18, qualityGrade: "B",
        location: "Agra, UP", distance: 230, harvestDate: "2026-02-05",
        deliveryEstimate: "2 days", image: "", category: "Vegetables",
    },
    {
        id: "L004", cropName: "Wheat", farmerName: "Mohan Lal", farmerId: "F4",
        quantity: 2000, unit: "kg", pricePerUnit: 28, qualityGrade: "A",
        location: "Indore, MP", distance: 180, harvestDate: "2026-01-25",
        deliveryEstimate: "3 days", image: "", category: "Grains",
    },
    {
        id: "L005", cropName: "Rice (Basmati)", farmerName: "Gurpreet Kaur", farmerId: "F5",
        quantity: 1500, unit: "kg", pricePerUnit: 65, qualityGrade: "A",
        location: "Karnal, Haryana", distance: 120, harvestDate: "2026-02-01",
        deliveryEstimate: "2 days", image: "", category: "Grains",
    },
    {
        id: "L006", cropName: "Green Chilli", farmerName: "Lakshmi Devi", farmerId: "F6",
        quantity: 200, unit: "kg", pricePerUnit: 45, qualityGrade: "B",
        location: "Guntur, AP", distance: 650, harvestDate: "2026-02-12",
        deliveryEstimate: "3 days", image: "", category: "Vegetables",
    },
    {
        id: "L007", cropName: "Mango (Alphonso)", farmerName: "Vijay Deshmukh", farmerId: "F7",
        quantity: 300, unit: "kg", pricePerUnit: 120, qualityGrade: "A",
        location: "Ratnagiri, Maharashtra", distance: 350, harvestDate: "2026-02-11",
        deliveryEstimate: "2 days", image: "", category: "Fruits",
    },
    {
        id: "L008", cropName: "Banana", farmerName: "Anand Sharma", farmerId: "F8",
        quantity: 600, unit: "dozen", pricePerUnit: 35, qualityGrade: "A",
        location: "Jalgaon, Maharashtra", distance: 90, harvestDate: "2026-02-13",
        deliveryEstimate: "1 day", image: "", category: "Fruits",
    },
];

export const mockOrders = [
    {
        id: "ORD-1001", listingId: "L001", cropName: "Tomato", farmerName: "Ram Singh",
        quantity: 100, unit: "kg", totalPrice: 3200, status: "completed",
        paymentStatus: "paid", placedAt: "2026-02-10T09:00:00", updatedAt: "2026-02-10T14:00:00",
    },
    {
        id: "ORD-1002", listingId: "L002", cropName: "Onion", farmerName: "Suresh Patil",
        quantity: 200, unit: "kg", totalPrice: 5000, status: "accepted",
        paymentStatus: "paid", placedAt: "2026-02-12T11:00:00", updatedAt: "2026-02-12T13:00:00",
    },
    {
        id: "ORD-1003", listingId: "L005", cropName: "Rice (Basmati)", farmerName: "Gurpreet Kaur",
        quantity: 500, unit: "kg", totalPrice: 32500, status: "pending",
        paymentStatus: "pending", placedAt: "2026-02-13T08:00:00", updatedAt: "2026-02-13T08:00:00",
    },
    {
        id: "ORD-1004", listingId: "L003", cropName: "Potato", farmerName: "Hari Prasad",
        quantity: 150, unit: "kg", totalPrice: 2700, status: "cancelled",
        paymentStatus: "refunded", placedAt: "2026-02-09T10:00:00", updatedAt: "2026-02-09T16:00:00",
    },
];
