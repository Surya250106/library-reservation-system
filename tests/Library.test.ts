import { Library } from "../src/Library";
import { Book } from "../src/Book";
import { MemberFactory } from "../src/MemberFactory";

describe("Library Book Reservation System Tests", () => {
  describe("Factory Tests", () => {
    test("standard member -> borrowingLimit = 3", () => {
      const member = MemberFactory.createMember("standard", "Alice");
      expect(member.name).toBe("Alice");
      expect(member.type).toBe("standard");
      expect(member.borrowingLimit).toBe(3);
    });

    test("student member -> borrowingLimit = 5", () => {
      const member = MemberFactory.createMember("student", "Bob");
      expect(member.name).toBe("Bob");
      expect(member.type).toBe("student");
      expect(member.borrowingLimit).toBe(5);
    });

    test("staff member -> borrowingLimit = 10", () => {
      const member = MemberFactory.createMember("staff", "Charlie");
      expect(member.name).toBe("Charlie");
      expect(member.type).toBe("staff");
      expect(member.borrowingLimit).toBe(10);
    });

    test("factory throws meaningful error for invalid type", () => {
      expect(() => MemberFactory.createMember("guest", "Dave")).toThrow(
        'Invalid member type: "guest"'
      );
    });
  });

  describe("Book Tests", () => {
    test("title and author are stored correctly", () => {
      const book = new Book("The Hobbit", "J.R.R. Tolkien");
      expect(book.title).toBe("The Hobbit");
      expect(book.author).toBe("J.R.R. Tolkien");
    });

    test("isReserved is initially false", () => {
      const book = new Book("The Hobbit", "J.R.R. Tolkien");
      expect(book.isReserved).toBe(false);
      expect(book.reservedBy).toBeNull();
    });

    test("reserve() changes isReserved to true", () => {
      const book = new Book("The Hobbit", "J.R.R. Tolkien");
      const member = MemberFactory.createMember("standard", "Alice");
      book.reserve(member);
      expect(book.isReserved).toBe(true);
      expect(book.reservedBy).toBe(member);
    });
  });

  describe("Find Tests", () => {
    let library: Library;

    beforeEach(() => {
      library = new Library();
      library.addBook("Dune", "Frank Herbert");
    });

    test("existing books can be found", () => {
      const book = library.findBook("Dune");
      expect(book).toBeDefined();
      expect(book?.title).toBe("Dune");
      expect(book?.author).toBe("Frank Herbert");
    });

    test("non-existing books return undefined", () => {
      const book = library.findBook("Non Existing");
      expect(book).toBeUndefined();
    });

    test("existing members can be found", () => {
      const member = library.registerMember("Charlie", "student");
      const found = library.findMember(member.id);
      expect(found).toBeDefined();
      expect(found?.name).toBe("Charlie");
      expect(found?.id).toBe(member.id);
    });
  });

  describe("Reservation Limit Test", () => {
    test("standard member cannot reserve more than 3 books", () => {
      const library = new Library();
      const member = library.registerMember("Alice", "standard");

      library.addBook("Book 1", "Author 1");
      library.addBook("Book 2", "Author 2");
      library.addBook("Book 3", "Author 3");
      library.addBook("Book 4", "Author 4");

      // Reserve first 3 successfully
      library.reserveBook(member.id, "Book 1");
      library.reserveBook(member.id, "Book 2");
      library.reserveBook(member.id, "Book 3");

      // Attempt to reserve the fourth should throw "Reservation limit reached"
      expect(() => {
        library.reserveBook(member.id, "Book 4");
      }).toThrow("Reservation limit reached");
    });
  });

  describe("Waitlist Notification Test", () => {
    test("Waitlisted members receive notifications when book returned", () => {
      const library = new Library();
      const book = library.addBook("The Hobbit", "J.R.R. Tolkien");

      const owner = library.registerMember("Owner", "standard");
      const alice = library.registerMember("Alice", "standard");
      const bob = library.registerMember("Bob", "standard");

      // Owner reserves
      library.reserveBook(owner.id, "The Hobbit");

      // Alice & Bob join waitlist
      library.reserveBook(alice.id, "The Hobbit");
      library.reserveBook(bob.id, "The Hobbit");

      // Spy on console.log
      const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

      // Return book
      library.returnBook("The Hobbit");

      // Assert console output contains notifications for both waitlisted members
      expect(logSpy).toHaveBeenCalledWith(
        'Notification for Alice: The book "The Hobbit" is now available.'
      );
      expect(logSpy).toHaveBeenCalledWith(
        'Notification for Bob: The book "The Hobbit" is now available.'
      );

      logSpy.mockRestore();
    });
  });

  describe("FIFO Test", () => {
    test("Charlie returns Dune -> Dave gets it, Eve remains in waitlist", () => {
      const library = new Library();
      const book = library.addBook("Dune", "Frank Herbert");

      const charlie = library.registerMember("Charlie", "standard");
      const dave = library.registerMember("Dave", "standard");
      const eve = library.registerMember("Eve", "standard");

      // Charlie reserves Dune
      library.reserveBook(charlie.id, "Dune");

      // Dave enters waitlist first
      library.reserveBook(dave.id, "Dune");

      // Eve enters waitlist second
      library.reserveBook(eve.id, "Dune");

      // Verify waitlist initial order
      expect(book.getWaitlist()).toEqual([dave, eve]);

      // Charlie returns book
      library.returnBook("Dune");

      // Dave receives Dune
      expect(book.isReserved).toBe(true);
      expect(book.reservedBy).toBe(dave);

      // Dave is removed from waitlist, Eve remains on waitlist
      expect(book.getWaitlist()).toEqual([eve]);
    });
  });

  describe("Fine Test", () => {
    test("10 days overdue at $0.50 per day equals $5", () => {
      const library = new Library();
      const member = library.registerMember("Alice", "standard");

      const currentDate = new Date();
      // Exactly 10 days in the past relative to currentDate
      const tenDaysAgo = new Date(currentDate.getTime() - 10 * 24 * 60 * 60 * 1000);

      const reservation = {
        bookTitle: "Dune",
        dueDate: tenDaysAgo,
      };

      // Add to member's active reservations
      member.activeReservations.push(reservation);

      const fine = library.calculateFine(member.id, currentDate);
      expect(fine).toBe(5);

      // Verify calculation directly with reservation object
      const directFine = library.calculateFine(reservation, currentDate);
      expect(directFine).toBe(5);
    });
  });
});
