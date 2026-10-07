CREATE DATABASE giftora;


USE giftora;


CREATE TABLE admin (
    AdminID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Email VARCHAR(150) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE category (
    CategoryID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL UNIQUE,
    Description TEXT
);



CREATE TABLE product (
    ProductID INT AUTO_INCREMENT PRIMARY KEY,

    CategoryID INT NOT NULL,

    Title VARCHAR(150) NOT NULL,

    Description TEXT,

    Price DECIMAL(10,2) NOT NULL,

    StockQuantity INT NOT NULL DEFAULT 0,

    ImageURL VARCHAR(255),

    Customizable BOOLEAN NOT NULL DEFAULT FALSE,

    IsActive BOOLEAN NOT NULL DEFAULT TRUE,

    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT FK_Product_Category
        FOREIGN KEY (CategoryID)
        REFERENCES category(CategoryID)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);


CREATE TABLE customization (
    CustomizationID INT AUTO_INCREMENT PRIMARY KEY,

    CustomName VARCHAR(150),

    CustomMessage TEXT,

    ImageURL VARCHAR(255),

    EngravingText TEXT,

    SpecialInstruction TEXT
);


CREATE TABLE customer (
    CustomerID INT AUTO_INCREMENT PRIMARY KEY,

    FullName VARCHAR(100) NOT NULL,

    NIC VARCHAR(20),

    Email VARCHAR(150) NOT NULL UNIQUE,

    MobileNo VARCHAR(20),

    PasswordHash VARCHAR(255) NOT NULL,

    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    ShippingAddress TEXT,

    BillingAddress TEXT
);


CREATE TABLE orders (
    OrderID INT AUTO_INCREMENT PRIMARY KEY,

    CustomerID INT NOT NULL,

    OrderDate DATETIME DEFAULT CURRENT_TIMESTAMP,

    TotalAmount DECIMAL(10,2) NOT NULL DEFAULT 0.00,

    Status VARCHAR(30) NOT NULL DEFAULT 'Pending',

    DeliveryAddress TEXT NOT NULL,

    CONSTRAINT FK_Orders_Customer
        FOREIGN KEY (CustomerID)
        REFERENCES customer(CustomerID)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);


CREATE TABLE orderitem (
    OrderItemID INT AUTO_INCREMENT PRIMARY KEY,

    OrderID INT NOT NULL,

    ProductID INT NOT NULL,

    CustomizationID INT NULL,

    Quantity INT NOT NULL DEFAULT 1,

    UnitPrice DECIMAL(10,2) NOT NULL,

    CONSTRAINT FK_OrderItem_Order
        FOREIGN KEY (OrderID)
        REFERENCES orders(OrderID)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT FK_OrderItem_Product
        FOREIGN KEY (ProductID)
        REFERENCES product(ProductID)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT FK_OrderItem_Customization
        FOREIGN KEY (CustomizationID)
        REFERENCES customization(CustomizationID)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);


CREATE TABLE payment (
    PaymentID INT AUTO_INCREMENT PRIMARY KEY,

    OrderID INT NOT NULL UNIQUE,

    PaymentMethod VARCHAR(50) NOT NULL,

    Amount DECIMAL(10,2) NOT NULL,

    PaymentDate DATETIME DEFAULT CURRENT_TIMESTAMP,

    Status VARCHAR(30) NOT NULL DEFAULT 'Pending',

    TransactionReference VARCHAR(150),

    CONSTRAINT FK_Payment_Order
        FOREIGN KEY (OrderID)
        REFERENCES orders(OrderID)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);







INSERT INTO category (Name, Description)
VALUES
('Gift Boxes', 'Beautifully arranged gift boxes for special occasions.'),
('Cakes', 'Customized cakes for birthdays and celebrations.'),
('Candles', 'Handmade decorative and scented candles.'),
('Greeting Cards', 'Beautiful greeting cards for different occasions.'),
('Resin Keychains', 'Personalized handmade resin keychains.'),
('Photo Gifts', 'Personalized gifts made using customer photographs.'),
('Wooden Gifts', 'Handcrafted wooden gifts and decorations.');


INSERT INTO product
(CategoryID, Title, Description, Price, StockQuantity, ImageURL, Customizable)
VALUES

(1, 'Elegant Celebration Gift Box',
 'A beautifully arranged gift box filled with carefully selected items, perfect for birthdays and celebrations.',
 4500.00, 10, 'shop_images/box01.png', 1),

(1, 'Luxury Surprise Gift Box',
 'A premium handmade gift box designed to create a memorable surprise for someone special.',
 5200.00, 8, 'shop_images/box02.png', 1),

(1, 'Romantic Pink Gift Box',
 'A charming pink-themed gift box perfect for anniversaries, romantic occasions and special moments.',
 4800.00, 12, 'shop_images/box03.png', 1),

(1, 'Sweet Treat Gift Box',
 'A delightful handmade gift box containing a beautiful collection of sweet treats.',
 4300.00, 10, 'shop_images/box05.png', 1),

(1, 'Classic Red Gift Box',
 'A stylish red gift box carefully prepared for birthdays, anniversaries and celebrations.',
 5000.00, 7, 'shop_images/box06.png', 1),

(1, 'Blue Surprise Gift Box',
 'A colorful blue-themed gift box prepared for a unique and thoughtful gifting experience.',
 4700.00, 9, 'shop_images/box08.jpeg', 1),

(1, 'Colorful Happiness Box',
 'A cheerful handmade gift box filled with colorful surprises for someone you care about.',
 4900.00, 11, 'shop_images/box09.jpeg', 1),

(1, 'Pastel Dream Gift Box',
 'A beautiful pastel-themed gift box suitable for birthdays, graduations and special occasions.',
 5300.00, 6, 'shop_images/box10.jpeg', 1),

(1, 'Fun Celebration Gift Box',
 'A bright and playful gift box designed to make celebrations even more memorable.',
 4600.00, 10, 'shop_images/box11.jpeg', 1),

(1, 'Green Nature Gift Box',
 'A refreshing nature-inspired gift box featuring a beautiful combination of handmade gifts.',
 5100.00, 8, 'shop_images/box12.jpeg', 1),

(1, 'Pink Blossom Gift Box',
 'A lovely pink gift box perfect for birthdays, anniversaries and thoughtful surprises.',
 5400.00, 7, 'shop_images/box13.jpeg', 1),

(1, 'Personalized Memory Box',
 'A carefully arranged memory gift box that can be personalized with a special message.',
 5600.00, 5, 'shop_images/box14.jpeg', 1),

(1, 'Colorful Joy Gift Box',
 'A colorful handmade gift collection designed to bring happiness to any celebration.',
 4750.00, 9, 'shop_images/box15.jpeg', 1),

(1, 'Heartfelt Gift Box',
 'A heart-themed gift box designed for expressing love and appreciation.',
 5800.00, 6, 'shop_images/box16.jpeg', 1),

(1, 'Golden Heart Gift Box',
 'An elegant heart-themed gift box suitable for romantic occasions and anniversaries.',
 6200.00, 5, 'shop_images/box17.jpeg', 1),

(1, 'Premium Celebration Box',
 'A premium collection of handmade gifts beautifully arranged for a memorable celebration.',
 6500.00, 4, 'shop_images/box18.jpeg', 1),

(1, 'Blue Luxury Gift Box',
 'A sophisticated blue gift box containing a carefully selected collection of gifts.',
 6100.00, 5, 'shop_images/box19.jpeg', 1),

(1, 'Romantic Red Gift Box',
 'A romantic red-themed gift box created especially for love and anniversary celebrations.',
 6700.00, 4, 'shop_images/box20.jpeg', 1),

(2, 'Pink Floral Celebration Cake',
 'A beautiful pink cake decorated with elegant floral details, perfect for birthdays.',
 3500.00, 5, 'shop_images/cake01.png', 1),

(2, 'Heart Love Cake',
 'A romantic heart-shaped cake designed for anniversaries and special celebrations.',
 3800.00, 5, 'shop_images/cake02.png', 1),

(2, 'Elegant Birthday Cake',
 'A beautifully decorated birthday cake prepared for unforgettable celebrations.',
 4000.00, 4, 'shop_images/cake03.png', 1),

(2, 'Golden Celebration Cake',
 'A stylish golden-themed cake suitable for birthdays and milestone celebrations.',
 4200.00, 4, 'shop_images/cake04.jpeg', 1),

(2, 'Cute Character Cake',
 'A fun and colorful character-themed cake perfect for children and playful celebrations.',
 3900.00, 5, 'shop_images/cake05.jpeg', 1),

(2, 'Personalized Character Cake',
 'A creative personalized cake featuring a cute decorative character design.',
 4100.00, 4, 'shop_images/cake06.jpeg', 1),

(2, 'Elegant White Cake',
 'A simple and elegant white cake suitable for birthdays, weddings and special events.',
 4300.00, 5, 'shop_images/cake07.jpeg', 1),

(2, 'Classic Celebration Cake',
 'A beautifully decorated classic cake suitable for any special occasion.',
 3600.00, 6, 'shop_images/cake08.jpeg', 1),

(2, 'Pink Ribbon Cake',
 'A charming pink cake decorated with a beautiful ribbon-inspired design.',
 3900.00, 5, 'shop_images/cake09.jpeg', 1),

(2, 'Floral Garden Cake',
 'A delicate floral cake inspired by a beautiful garden, perfect for celebrations.',
 4500.00, 4, 'shop_images/cake10.jpeg', 1),

(2, 'Blue Celebration Cake',
 'A beautiful blue-themed cake ideal for birthdays and joyful celebrations.',
 4000.00, 5, 'shop_images/cake11.jpeg', 1),

(2, 'Luxury Floral Cake',
 'A premium floral cake carefully decorated for elegant celebrations.',
 4800.00, 3, 'shop_images/cake12.jpeg', 1),

(2, 'Pink Dream Cake',
 'A soft pink cake with charming decorations for birthdays and special occasions.',
 4200.00, 5, 'shop_images/cake13.jpeg', 1),

(2, 'Elegant White Rose Cake',
 'An elegant white cake decorated with beautiful rose-inspired details.',
 4600.00, 4, 'shop_images/cake14.jpeg', 1),

(2, 'Rainbow Celebration Cake',
 'A colorful celebration cake designed to bring fun and happiness to any event.',
 4400.00, 5, 'shop_images/cake15.jpeg', 1),

(2, 'Garden Party Cake',
 'A beautifully decorated cake inspired by colorful flowers and garden celebrations.',
 4700.00, 4, 'shop_images/cake16.jpeg', 1),

(2, 'Red Heart Cake',
 'A romantic red heart cake perfect for anniversaries and expressions of love.',
 4300.00, 5, 'shop_images/cake17.jpeg', 1),

(2, 'Chocolate Celebration Cake',
 'A rich chocolate-themed celebration cake for chocolate lovers and special occasions.',
 4500.00, 5, 'shop_images/cake18.jpeg', 1),

(2, 'Minimalist Celebration Cake',
 'A simple and elegant cake design suitable for modern celebrations.',
 3800.00, 6, 'shop_images/cake19.jpeg', 1),

(2, 'Colorful Party Cake',
 'A bright and colorful cake created for joyful birthday parties and celebrations.',
 4100.00, 5, 'shop_images/cake20.jpeg', 1),

(3, 'Rose Scented Candle',
 'A handmade rose-scented candle that adds a warm and relaxing atmosphere to any room.',
 1500.00, 15, 'shop_images/candle01.png', 0),

(3, 'Lavender Calm Candle',
 'A calming lavender-inspired handmade candle perfect for relaxation.',
 1600.00, 14, 'shop_images/candle02.png', 0),

(3, 'Vanilla Delight Candle',
 'A sweet vanilla-scented candle designed to create a cozy atmosphere.',
 1550.00, 12, 'shop_images/candle03.png', 0),

(3, 'Luxury Jar Candle',
 'A stylish handmade jar candle that makes an elegant decorative gift.',
 1800.00, 10, 'shop_images/candle04.png', 0),

(3, 'Romantic Rose Candle',
 'A beautiful decorative candle with a romantic rose-inspired design.',
 1700.00, 12, 'shop_images/candle05.jpeg', 0),

(3, 'Citrus Glow Candle',
 'A refreshing citrus-inspired candle with a bright and cheerful appearance.',
 1650.00, 13, 'shop_images/candle06.jpeg', 0),

(3, 'Blue Ocean Candle',
 'A beautiful blue decorative candle inspired by the calming colors of the ocean.',
 1750.00, 10, 'shop_images/candle07.jpeg', 0),

(3, 'Coffee Aroma Candle',
 'A warm coffee-inspired candle perfect for creating a cozy environment.',
 1850.00, 11, 'shop_images/candle08.jpeg', 0),

(3, 'Rustic Handmade Candle',
 'A rustic handmade candle that adds a natural and elegant touch to your home.',
 1600.00, 14, 'shop_images/candle09.jpeg', 0),

(3, 'Pastel Flower Candle',
 'A decorative pastel candle featuring a delicate floral-inspired design.',
 1900.00, 9, 'shop_images/candle10.jpeg', 0),

(3, 'Warm Vanilla Candle',
 'A warm vanilla candle suitable for relaxation, decoration and gifting.',
 1550.00, 15, 'shop_images/candle11.jpeg', 0),

(3, 'Green Botanical Candle',
 'A nature-inspired botanical candle with a fresh and elegant appearance.',
 1750.00, 12, 'shop_images/candle12.jpeg', 0),

(4, 'Floral Birthday Card',
 'A beautiful handmade birthday card decorated with colorful floral details.',
 600.00, 25, 'shop_images/card01.png', 1),

(4, 'Best Wishes Card',
 'A simple and elegant handmade card for sending warm wishes to someone special.',
 550.00, 30, 'shop_images/card02.jpg', 1),

(4, 'Happy Birthday Card',
 'A cheerful handmade birthday card suitable for friends and family.',
 650.00, 25, 'shop_images/card03.jpg', 1),

(4, 'Elegant Blue Card',
 'A stylish blue greeting card suitable for birthdays and special occasions.',
 600.00, 20, 'shop_images/card04.jpg', 1),

(4, 'Spring Flowers Card',
 'A colorful floral greeting card inspired by the beauty of spring.',
 700.00, 20, 'shop_images/card05.png', 1),

(4, 'Thank You Card',
 'A thoughtful handmade thank-you card for showing appreciation and gratitude.',
 550.00, 25, 'shop_images/card06.jpg', 1),

(4, 'Special Moment Card',
 'A charming handmade card created for celebrating meaningful moments.',
 650.00, 20, 'shop_images/card07.jpg', 1),

(4, 'Love Message Card',
 'A romantic handmade card perfect for expressing love and appreciation.',
 700.00, 20, 'shop_images/card08.jpg', 1),

(4, 'Heartfelt Wishes Card',
 'A heart-themed greeting card designed to express warm wishes.',
 650.00, 25, 'shop_images/card09.jpg', 1),

(4, 'Happy Anniversary Card',
 'A romantic anniversary card with an elegant handmade design.',
 750.00, 20, 'shop_images/card10.jpg', 1),

(4, 'Thinking of You Card',
 'A thoughtful handmade card for letting someone know they are remembered.',
 600.00, 25, 'shop_images/card11.jpg', 1),

(4, 'Congratulations Card',
 'A beautiful congratulations card suitable for graduations and achievements.',
 650.00, 25, 'shop_images/card12.jpg', 1),

(4, 'Thankful Heart Card',
 'A heartfelt handmade card designed to express appreciation and gratitude.',
 600.00, 25, 'shop_images/card13.jpg', 1),

(4, 'Elegant Floral Wishes Card',
 'A premium floral greeting card suitable for birthdays and special occasions.',
 750.00, 20, 'shop_images/card14.jpg', 1),

(5, 'Pink Resin Flower Keychain',
 'A delicate handmade resin keychain featuring a beautiful pink floral design.',
 900.00, 20, 'shop_images/key01.png', 1),

(5, 'Blue Resin Keychain',
 'A colorful blue resin keychain perfect for everyday use or gifting.',
 850.00, 22, 'shop_images/key02.png', 1),

(5, 'Purple Floral Keychain',
 'A handmade purple resin keychain decorated with beautiful floral details.',
 950.00, 18, 'shop_images/key03.jpeg', 1),

(5, 'Personalized Resin Charm',
 'A unique handmade resin charm that can be personalized with a name or message.',
 1100.00, 15, 'shop_images/key04.jpeg', 1),

(5, 'Blue Glitter Keychain',
 'A sparkling handmade resin keychain with an attractive blue glitter finish.',
 1000.00, 18, 'shop_images/key05.jpeg', 1),

(5, 'Colorful Resin Keychain',
 'A colorful handmade resin keychain designed for a fun and cheerful look.',
 900.00, 20, 'shop_images/key06.jpeg', 1),

(5, 'Green Resin Charm',
 'A fresh green resin charm suitable for bags, keys and personalized gifts.',
 850.00, 20, 'shop_images/key07.jpeg', 1),

(5, 'Cute Character Keychain',
 'A cute handmade resin keychain with a playful character-inspired design.',
 950.00, 18, 'shop_images/key08.jpeg', 1),

(5, 'Handmade Flower Keychain',
 'A delicate floral resin keychain carefully handmade for a unique appearance.',
 900.00, 20, 'shop_images/key09.jpeg', 1),

(5, 'Elegant Resin Pair Keychain',
 'A stylish resin keychain design suitable as a small personalized gift.',
 1050.00, 16, 'shop_images/key10.png', 1),

(5, 'Colorful Botanical Keychain',
 'A handmade resin keychain containing colorful decorative elements.',
 950.00, 18, 'shop_images/key11.png', 1),

(5, 'Nature Inspired Keychain',
 'A beautiful handmade resin keychain inspired by natural colors and patterns.',
 1000.00, 16, 'shop_images/key12.jpeg', 1),

(6, 'Personalized Photo Gift',
 'A beautiful personalized gift featuring a special photograph and meaningful memories.',
 2200.00, 12, 'shop_images/photo01.png', 1),

(6, 'Memory Photo Frame',
 'A thoughtful personalized photo gift designed to preserve a memorable moment.',
 2500.00, 10, 'shop_images/photo02.png', 1),

(6, 'Colorful Memory Gift',
 'A creative personalized photo gift for celebrating special memories.',
 2800.00, 10, 'shop_images/photo03.png', 1),

(6, 'Family Photo Gift',
 'A personalized photo gift designed to celebrate family memories and special moments.',
 3000.00, 8, 'shop_images/photo04.jpeg', 1),

(6, 'Romantic Photo Gift',
 'A romantic personalized photo gift perfect for anniversaries and couples.',
 3200.00, 8, 'shop_images/photo05.jpeg', 1),

(6, 'Elegant Memory Frame',
 'An elegant photo gift designed to display a meaningful memory beautifully.',
 2700.00, 10, 'shop_images/photo06.jpeg', 1),

(6, 'Yellow Memory Gift',
 'A bright and cheerful personalized photo gift for birthdays and celebrations.',
 2400.00, 12, 'shop_images/photo07.jpeg', 1),

(6, 'Love Memory Gift',
 'A romantic personalized photo gift created for someone special.',
 2900.00, 9, 'shop_images/photo08.jpeg', 1),

(6, 'Special Moment Photo Gift',
 'A personalized keepsake designed to preserve a favorite special moment.',
 3100.00, 8, 'shop_images/photo09.jpeg', 1),


(7, 'Personalized Wooden Plaque',
 'A handcrafted wooden plaque that can be personalized with names or special messages.',
 2500.00, 10, 'shop_images/wood01.png', 1),

(7, 'Family Wooden Frame',
 'A beautiful wooden frame designed to celebrate family memories.',
 2800.00, 8, 'shop_images/wood02.png', 1),

(7, 'Custom Name Wooden Gift',
 'A personalized wooden gift featuring a custom name or meaningful message.',
 3000.00, 8, 'shop_images/wood03.png', 1),

(7, 'Rustic Wooden Sign',
 'A charming rustic wooden sign suitable for home decoration and gifting.',
 2200.00, 12, 'shop_images/wood04.jpeg', 1),

(7, 'Heart Wooden Keepsake',
 'A heart-shaped wooden keepsake designed as a meaningful personalized gift.',
 2600.00, 10, 'shop_images/wood05.jpeg', 1),

(7, 'Family Memories Wooden Plaque',
 'A handcrafted wooden plaque celebrating family and beautiful shared memories.',
 3200.00, 7, 'shop_images/wood06.jpeg', 1),

(7, 'Open House Wooden Sign',
 'A decorative wooden sign suitable for home decoration and special events.',
 2000.00, 12, 'shop_images/wood07.jpeg', 0),

(7, 'Welcome Wooden Sign',
 'A charming handmade wooden sign designed to create a warm welcome.',
 2200.00, 10, 'shop_images/wood08.jpeg', 0),

(7, 'Closed Wooden Sign',
 'A simple handmade wooden sign suitable for shops, homes and small businesses.',
 1800.00, 12, 'shop_images/wood09.jpeg', 0),

(7, 'Personalized Family Sign',
 'A personalized wooden sign designed to celebrate family and togetherness.',
 2900.00, 8, 'shop_images/wood10.jpeg', 1),

(7, 'Custom Address Plaque',
 'A personalized wooden address plaque suitable for decorating the entrance of a home.',
 3500.00, 7, 'shop_images/wood11.jpeg', 1),

(7, 'Rustic Quote Plaque',
 'A rustic wooden plaque featuring a meaningful quote or personalized message.',
 2600.00, 10, 'shop_images/wood12.jpeg', 1),

(7, 'Family Photo Wood Gift',
 'A personalized wooden gift combining family memories with a handcrafted design.',
 3300.00, 7, 'shop_images/wood13.jpeg', 1),

(7, 'Personalized Portrait Plaque',
 'A unique wooden plaque designed to celebrate a person or special memory.',
 3800.00, 6, 'shop_images/wood14.jpeg', 1),

(7, 'Heart Couple Wooden Plaque',
 'A romantic wooden plaque designed especially for couples and anniversaries.',
 3400.00, 7, 'shop_images/wood15.jpeg', 1),

(7, 'Custom Couple Gift',
 'A personalized wooden keepsake created for couples and romantic occasions.',
 3600.00, 7, 'shop_images/wood16.jpeg', 1),

(7, 'Heart Family Keepsake',
 'A beautiful heart-shaped wooden keepsake celebrating love and family.',
 3000.00, 8, 'shop_images/wood18.jpeg', 1),

(7, 'Personalized Wooden Love Gift',
 'A romantic handcrafted wooden gift suitable for anniversaries and special occasions.',
 3500.00, 7, 'shop_images/wood19.jpeg', 1);


 