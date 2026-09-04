import { Library } from "./Library";

/**
 * Main function demonstrating the functionality of the Library Reservation System.
 */
function main() {
  console.log("=== Library Reservation System Demonstration ===");

  // 1. Create a Library
  const library = new Library();

  // 2. Add books
  console.log("\n--- Adding Books ---");
  const book1 = library.addBook("The Hobbit", "J.R.R. Tolkien");
  const book2 = library.addBook("Dune", "Frank Herbert");
  console.log(`Added: "${book1.title}" by ${book1.author}`);
  console.log(`Added: "${book2.title}" by ${book2.author}`);

  // 3. Register members
  console.log("\n--- Registering Members ---");
  const charlie = library.registerMember("Charlie", "student");
  const dave = library.registerMember("Dave", "standard");
  const eve = library.registerMember("Eve", "staff");
  console.log(`Registered Student: ${charlie.name} (ID: ${charlie.id}, limit: ${charlie.borrowingLimit})`);
  console.log(`Registered Standard: ${dave.name} (ID: ${dave.id}, limit: ${dave.borrowingLimit})`);
  console.log(`Registered Staff: ${eve.name} (ID: ${eve.id}, limit: ${eve.borrowingLimit})`);

  // 4. Reserve a book (Charlie reserves Dune)
  console.log("\n--- Reserving Dune ---");
  library.reserveBook(charlie.id, "Dune");
  console.log(`"Dune" isReserved: ${book2.isReserved}, reservedBy: ${book2.reservedBy?.name}`);

  // 5. Add members to waitlist (Dave and Eve try to reserve Dune)
  console.log("\n--- Adding Dave and Eve to Waitlist ---");
  library.reserveBook(dave.id, "Dune");
  library.reserveBook(eve.id, "Dune");
  console.log(`"Dune" Waitlist: ${book2.getWaitlist().map(m => m.name).join(", ")}`);

  // 6. Return a book (Charlie returns Dune) & 7. Demonstrate the notification behavior
  console.log("\n--- Charlie Returns Dune (Waitlist notifications should trigger) ---");
  library.returnBook("Dune");

  // Show final state after return
  console.log("\n--- Updated Dune Reservation State ---");
  console.log(`"Dune" isReserved: ${book2.isReserved}, reservedBy: ${book2.reservedBy?.name}`);
  console.log(`"Dune" Waitlist Remaining: ${book2.getWaitlist().map(m => m.name).join(", ")}`);
}

main();
