export const translations = {
    en: {
        // Navbar
        home: "Home",
        about: "About",
        careers: "Careers",
        services: "Services",
        
        // Services
        accounting: "Accounting",
        taxPlanning: "Tax Planning",
        consulting: "Consulting",
        invoiceServices: "Invoice Services",
        
        // Hero
        heroTitle: "Track Your Expenses",
        heroTitleAccent: "Effortlessly",
        heroDescription: "Take control of your finances with Compta. Create trips, track expenses, and generate reports — all in one beautiful interface.",
        createTrip: "Create a Trip",
        learnMore: "Learn More",
        freeToStart: "Free to start",
        noCreditCard: "No credit card required",
        cancelAnytime: "Cancel anytime",
        
        // Trip Form
        createNewTrip: "Create New Trip",
        tripDate: "Trip Date",
        income: "Income",
        notes: "Notes",
        notesPlaceholder: "Add any additional notes about this trip...",
        cancel: "Cancel",
        createTripError: "Failed to create trip. Please try again.",
        
        // Footer
        subscribeNewsletter: "Subscribe to newsletter",
        emailPlaceholder: "johndoe@gmail.com",
        subscribe: "Subscribe",
        footerServices: "Services",
        footerCompany: "Company",
        footerLegal: "Legal",
        aboutUs: "About us",
        contact: "Contact",
        pressKit: "Press kit",
        termsOfUse: "Terms of use",
        privacyPolicy: "Privacy policy",
        cookiePolicy: "Cookie policy",
        footerDescription: "Professional accounting solutions for your business needs.",
        
        // Footer services
        payroll: "Payroll",
        financialConsulting: "Financial Consulting",
        
        // Trips Table
        allTrips: "All Trips",
        fetchTripsError: "Failed to fetch trips",
        noTripsFound: "No trips found",
        createFirstTrip: "Create your first trip",
        date: "Date",
        createdAt: "Created At",
        noNotes: "No notes",
        addNewTrip: "Add New Trip",

        // Expenses
        expenses: "Expenses",
        allExpenses: "All Expenses",
        fetchExpensesError: "Failed to fetch expenses",
        noExpensesFound: "No expenses found",
        addNewExpense: "Add New Expense",
        createNewExpense: "Create New Expense",
        expenseDate: "Expense Date",
        carId: "Car ID",
        category: "Category",
        amount: "Amount",
        actions: "Actions",
        edit: "Edit",
        delete: "Delete",
        save: "Save",
        createExpenseError: "Failed to create expense. Please try again.",
        updateExpenseError: "Failed to update expense. Please try again.",
        deleteExpenseError: "Failed to delete expense. Please try again.",

        // Reports
        dailyReport: "Daily Report",
        dailyIncome: "Income",
        dailyExpenses: "Expenses",
        dailyNet: "Net",
        fetchReportError: "Failed to fetch report",
        downloadExcel: "Download Excel",

        // Filters
        from: "From",
        to: "To",
        filter: "Filter",
        clear: "Clear",
    },
    fr: {
        // Navbar
        home: "Accueil",
        about: "À propos",
        careers: "Carrières",
        services: "Services",
        
        // Services
        accounting: "Comptabilité",
        taxPlanning: "Planification fiscale",
        consulting: "Conseil",
        invoiceServices: "Services de facturation",
        
        // Hero
        heroTitle: "Suivez vos dépenses",
        heroTitleAccent: "facilement",
        heroDescription: "Prenez le contrôle de vos finances avec Compta. Créez des voyages, suivez vos dépenses et générez des rapports — le tout dans une belle interface.",
        createTrip: "Créer un voyage",
        learnMore: "En savoir plus",
        freeToStart: "Gratuit pour commencer",
        noCreditCard: "Pas de carte de crédit requise",
        cancelAnytime: "Annuler à tout moment",
        
        // Trip Form
        createNewTrip: "Créer un nouveau voyage",
        tripDate: "Date du voyage",
        income: "Revenu",
        notes: "Notes",
        notesPlaceholder: "Ajoutez des notes supplémentaires sur ce voyage...",
        cancel: "Annuler",
        createTripError: "Échec de la création du voyage. Veuillez réessayer.",
        
        // Footer
        subscribeNewsletter: "S'abonner à la newsletter",
        emailPlaceholder: "johndoe@gmail.com",
        subscribe: "S'abonner",
        footerServices: "Services",
        footerCompany: "Entreprise",
        footerLegal: "Mentions légales",
        aboutUs: "À propos de nous",
        contact: "Contact",
        pressKit: "Dossier de presse",
        termsOfUse: "Conditions d'utilisation",
        privacyPolicy: "Politique de confidentialité",
        cookiePolicy: "Politique de cookies",
        footerDescription: "Solutions comptables professionnelles pour vos besoins professionnels.",
        
        // Footer services
        payroll: "Paie",
        financialConsulting: "Conseil financier",
        
        // Trips Table
        allTrips: "Tous les voyages",
        fetchTripsError: "Échec de la récupération des voyages",
        noTripsFound: "Aucun voyage trouvé",
        createFirstTrip: "Créez votre premier voyage",
        date: "Date",
        createdAt: "Créé le",
        noNotes: "Aucune note",
        addNewTrip: "Ajouter un nouveau voyage",

        // Expenses
        expenses: "Dépenses",
        allExpenses: "Toutes les dépenses",
        fetchExpensesError: "Échec de la récupération des dépenses",
        noExpensesFound: "Aucune dépense trouvée",
        addNewExpense: "Ajouter une dépense",
        createNewExpense: "Créer une nouvelle dépense",
        expenseDate: "Date de dépense",
        carId: "ID de voiture",
        category: "Catégorie",
        amount: "Montant",
        actions: "Actions",
        edit: "Modifier",
        delete: "Supprimer",
        save: "Enregistrer",
        createExpenseError: "Échec de la création de la dépense. Veuillez réessayer.",
        updateExpenseError: "Échec de la mise à jour de la dépense. Veuillez réessayer.",
        deleteExpenseError: "Échec de la suppression de la dépense. Veuillez réessayer.",

        // Reports
        dailyReport: "Rapport quotidien",
        dailyIncome: "Revenu",
        dailyExpenses: "Dépenses",
        dailyNet: "Net",
        fetchReportError: "Échec de la récupération du rapport",
        downloadExcel: "Télécharger Excel",

        // Filters
        from: "Du",
        to: "Au",
        filter: "Filtrer",
        clear: "Effacer",
    },
} as const;

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.en;