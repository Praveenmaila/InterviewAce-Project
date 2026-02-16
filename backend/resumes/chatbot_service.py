"""
Static chatbot service for technical questions.
Uses keyword matching and predefined responses.
"""

import re
import random
import logging
from typing import List, Dict

logger = logging.getLogger(__name__)


# Knowledge base of technical questions and answers
KNOWLEDGE_BASE = {
    # Python
    "python": {
        "keywords": ["python", "py", "django", "flask", "pip"],
        "responses": {
            "what is python": "Python is a high-level, interpreted programming language known for its simplicity and readability. It supports multiple programming paradigms including procedural, object-oriented, and functional programming. Python is widely used for web development, data science, AI/ML, automation, and more.",
            "list vs tuple": "**Lists** are mutable (can be modified) and use square brackets `[]`. **Tuples** are immutable (cannot be modified after creation) and use parentheses `()`. Tuples are generally faster and use less memory. Use lists when you need to modify data, tuples for fixed collections.",
            "decorator": "A **decorator** in Python is a function that modifies the behavior of another function. It's denoted by `@decorator_name` above a function definition.\n\n```python\ndef my_decorator(func):\n    def wrapper(*args, **kwargs):\n        print('Before function')\n        result = func(*args, **kwargs)\n        print('After function')\n        return result\n    return wrapper\n\n@my_decorator\ndef say_hello():\n    print('Hello!')\n```",
            "generator": "A **generator** is a function that returns an iterator using `yield` instead of `return`. It generates values lazily (one at a time), which is memory-efficient for large datasets.\n\n```python\ndef count_up_to(n):\n    i = 1\n    while i <= n:\n        yield i\n        i += 1\n\nfor num in count_up_to(5):\n    print(num)  # 1, 2, 3, 4, 5\n```",
            "lambda": "A **lambda function** is an anonymous, single-expression function.\n\n```python\n# Regular function\ndef add(x, y):\n    return x + y\n\n# Lambda equivalent\nadd = lambda x, y: x + y\n\n# Common use with map/filter\nnumbers = [1, 2, 3, 4]\nsquared = list(map(lambda x: x**2, numbers))  # [1, 4, 9, 16]\n```",
            "default": "Python is a versatile programming language. Here are some key concepts:\n\n- **Variables**: Dynamically typed, no declaration needed\n- **Data structures**: Lists, tuples, dictionaries, sets\n- **OOP**: Classes, inheritance, polymorphism\n- **Libraries**: NumPy, Pandas, Django, Flask\n\nWhat specific Python topic would you like to learn about?"
        }
    },
    
    # JavaScript
    "javascript": {
        "keywords": ["javascript", "js", "node", "react", "vue", "angular", "typescript", "ts"],
        "responses": {
            "var let const": "**var**: Function-scoped, can be redeclared and updated, hoisted.\n**let**: Block-scoped, can be updated but not redeclared, not hoisted.\n**const**: Block-scoped, cannot be updated or redeclared, must be initialized.\n\n```javascript\nvar x = 1;   // Avoid using var\nlet y = 2;   // Use for variables that change\nconst z = 3; // Use for constants\n```",
            "closure": "A **closure** is a function that remembers its outer variables and can access them.\n\n```javascript\nfunction outer() {\n    let count = 0;\n    return function inner() {\n        count++;\n        return count;\n    };\n}\n\nconst counter = outer();\nconsole.log(counter()); // 1\nconsole.log(counter()); // 2\n```",
            "promise": "A **Promise** represents a value that may be available now, later, or never.\n\n```javascript\nconst myPromise = new Promise((resolve, reject) => {\n    setTimeout(() => {\n        resolve('Success!');\n    }, 1000);\n});\n\nmyPromise\n    .then(result => console.log(result))\n    .catch(error => console.log(error));\n\n// Or with async/await:\nasync function getData() {\n    const result = await myPromise;\n    console.log(result);\n}\n```",
            "async await": "**async/await** is syntactic sugar for Promises, making asynchronous code look synchronous.\n\n```javascript\nasync function fetchUser() {\n    try {\n        const response = await fetch('/api/user');\n        const data = await response.json();\n        return data;\n    } catch (error) {\n        console.error('Error:', error);\n    }\n}\n```",
            "arrow function": "**Arrow functions** are a concise syntax for writing functions.\n\n```javascript\n// Traditional\nfunction add(a, b) {\n    return a + b;\n}\n\n// Arrow function\nconst add = (a, b) => a + b;\n\n// With single parameter (no parentheses needed)\nconst square = x => x * x;\n\n// Arrow functions don't have their own 'this'\n```",
            "default": "JavaScript is the language of the web! Key concepts:\n\n- **ES6+**: let/const, arrow functions, classes, modules\n- **DOM**: Document manipulation\n- **Async**: Promises, async/await\n- **Frameworks**: React, Vue, Angular\n- **Runtime**: Node.js for server-side\n\nWhat JavaScript topic interests you?"
        }
    },
    
    # Data Structures
    "data_structures": {
        "keywords": ["array", "linked list", "stack", "queue", "tree", "graph", "hash", "heap", "data structure"],
        "responses": {
            "array": "An **array** is a collection of elements stored in contiguous memory locations.\n\n**Time Complexity:**\n- Access: O(1)\n- Search: O(n)\n- Insert/Delete at end: O(1)\n- Insert/Delete at beginning: O(n)\n\n**Use when:** You need fast random access and know the size in advance.",
            "linked list": "A **linked list** is a linear data structure where elements are stored in nodes, each pointing to the next.\n\n**Types:** Singly linked, Doubly linked, Circular\n\n**Time Complexity:**\n- Access: O(n)\n- Search: O(n)\n- Insert/Delete at beginning: O(1)\n- Insert/Delete at end: O(n) or O(1) with tail pointer\n\n**Use when:** Frequent insertions/deletions, unknown size.",
            "stack": "A **stack** is a LIFO (Last In, First Out) data structure.\n\n**Operations:**\n- push(): Add to top - O(1)\n- pop(): Remove from top - O(1)\n- peek(): View top - O(1)\n\n**Use cases:** Undo operations, browser history, function call stack, expression evaluation.",
            "queue": "A **queue** is a FIFO (First In, First Out) data structure.\n\n**Operations:**\n- enqueue(): Add to rear - O(1)\n- dequeue(): Remove from front - O(1)\n\n**Types:** Simple queue, Circular queue, Priority queue, Deque\n\n**Use cases:** Task scheduling, BFS traversal, print spooling.",
            "binary tree": "A **binary tree** is a tree where each node has at most two children.\n\n**Types:**\n- Full: Every node has 0 or 2 children\n- Complete: All levels filled except possibly last\n- Perfect: All internal nodes have 2 children, leaves at same level\n- BST: Left < Parent < Right\n\n**Traversals:** Inorder, Preorder, Postorder, Level-order",
            "hash table": "A **hash table** stores key-value pairs using a hash function.\n\n**Time Complexity (average):**\n- Insert: O(1)\n- Delete: O(1)\n- Search: O(1)\n\n**Collision handling:** Chaining, Open addressing\n\n**Use cases:** Caching, indexing, counting frequencies.",
            "default": "Common data structures and their use cases:\n\n- **Array**: Fast access, fixed size\n- **Linked List**: Dynamic size, frequent insertions\n- **Stack**: LIFO operations (undo, recursion)\n- **Queue**: FIFO operations (scheduling)\n- **Tree**: Hierarchical data, searching\n- **Graph**: Networks, relationships\n- **Hash Table**: Fast lookups\n\nWhich data structure would you like to explore?"
        }
    },
    
    # Algorithms
    "algorithms": {
        "keywords": ["algorithm", "sort", "search", "big o", "complexity", "recursion", "dynamic programming", "dp"],
        "responses": {
            "big o": "**Big O Notation** describes the upper bound of algorithm complexity.\n\n**Common complexities (best to worst):**\n- O(1): Constant - Array access\n- O(log n): Logarithmic - Binary search\n- O(n): Linear - Linear search\n- O(n log n): Linearithmic - Merge sort\n- O(n²): Quadratic - Bubble sort\n- O(2ⁿ): Exponential - Recursive fibonacci\n- O(n!): Factorial - Permutations",
            "sorting": "**Common sorting algorithms:**\n\n| Algorithm | Best | Average | Worst | Space |\n|-----------|------|---------|-------|-------|\n| Bubble | O(n) | O(n²) | O(n²) | O(1) |\n| Selection | O(n²) | O(n²) | O(n²) | O(1) |\n| Insertion | O(n) | O(n²) | O(n²) | O(1) |\n| Merge | O(n log n) | O(n log n) | O(n log n) | O(n) |\n| Quick | O(n log n) | O(n log n) | O(n²) | O(log n) |\n| Heap | O(n log n) | O(n log n) | O(n log n) | O(1) |",
            "binary search": "**Binary Search** finds an element in a sorted array by repeatedly dividing the search interval in half.\n\n```python\ndef binary_search(arr, target):\n    left, right = 0, len(arr) - 1\n    while left <= right:\n        mid = (left + right) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    return -1\n```\n\n**Time: O(log n)** | **Space: O(1)**",
            "recursion": "**Recursion** is when a function calls itself to solve smaller subproblems.\n\n**Key components:**\n1. Base case (stopping condition)\n2. Recursive case (function calls itself)\n\n```python\ndef factorial(n):\n    if n <= 1:  # Base case\n        return 1\n    return n * factorial(n - 1)  # Recursive case\n```\n\n**Tips:** Always define base case first, ensure progress toward base case.",
            "dynamic programming": "**Dynamic Programming (DP)** solves problems by breaking them into overlapping subproblems.\n\n**Approaches:**\n1. **Top-down (Memoization)**: Recursive with caching\n2. **Bottom-up (Tabulation)**: Iterative, builds up solutions\n\n```python\n# Fibonacci with DP\ndef fib(n, memo={}):\n    if n in memo:\n        return memo[n]\n    if n <= 1:\n        return n\n    memo[n] = fib(n-1, memo) + fib(n-2, memo)\n    return memo[n]\n```",
            "default": "Key algorithmic concepts:\n\n- **Big O**: Time/space complexity analysis\n- **Sorting**: Bubble, Merge, Quick, Heap sort\n- **Searching**: Linear, Binary search\n- **Recursion**: Self-calling functions\n- **Dynamic Programming**: Optimal substructure\n- **Greedy**: Local optimal choices\n\nWhat algorithm topic would you like to learn?"
        }
    },
    
    # SQL & Databases
    "database": {
        "keywords": ["sql", "database", "mysql", "postgres", "mongodb", "query", "join", "index"],
        "responses": {
            "join": "**SQL JOINs** combine rows from multiple tables.\n\n```sql\n-- INNER JOIN: Only matching rows\nSELECT * FROM users u\nINNER JOIN orders o ON u.id = o.user_id;\n\n-- LEFT JOIN: All from left + matching from right\nSELECT * FROM users u\nLEFT JOIN orders o ON u.id = o.user_id;\n\n-- RIGHT JOIN: All from right + matching from left\n-- FULL JOIN: All rows from both tables\n```",
            "index": "A **database index** improves query speed by providing quick data lookup.\n\n```sql\n-- Create index\nCREATE INDEX idx_user_email ON users(email);\n\n-- Composite index\nCREATE INDEX idx_name ON users(first_name, last_name);\n```\n\n**Pros:** Faster SELECT queries\n**Cons:** Slower INSERT/UPDATE, extra storage\n\n**When to use:** Columns in WHERE, JOIN, ORDER BY clauses.",
            "normalization": "**Database normalization** organizes data to reduce redundancy.\n\n**Normal Forms:**\n- **1NF**: Atomic values, no repeating groups\n- **2NF**: 1NF + no partial dependencies\n- **3NF**: 2NF + no transitive dependencies\n- **BCNF**: 3NF + every determinant is a candidate key\n\n**Trade-off:** Normalization reduces redundancy but may require more JOINs.",
            "acid": "**ACID** properties ensure reliable database transactions:\n\n- **Atomicity**: Transaction is all-or-nothing\n- **Consistency**: Database remains in valid state\n- **Isolation**: Concurrent transactions don't interfere\n- **Durability**: Committed changes persist\n\nSQL databases are ACID-compliant, NoSQL often trades ACID for performance.",
            "sql vs nosql": "**SQL (Relational):**\n- Structured schema\n- ACID compliant\n- Best for: Complex queries, transactions\n- Examples: PostgreSQL, MySQL, SQLite\n\n**NoSQL:**\n- Flexible schema\n- Horizontal scaling\n- Types: Document, Key-Value, Column, Graph\n- Best for: Large scale, unstructured data\n- Examples: MongoDB, Redis, Cassandra",
            "default": "Database fundamentals:\n\n- **SQL**: SELECT, INSERT, UPDATE, DELETE\n- **JOINs**: Combining tables\n- **Indexes**: Query optimization\n- **Normalization**: Data organization\n- **Transactions**: ACID properties\n- **NoSQL**: Non-relational alternatives\n\nWhat database topic interests you?"
        }
    },
    
    # Web Development
    "web": {
        "keywords": ["html", "css", "web", "api", "rest", "http", "frontend", "backend"],
        "responses": {
            "rest api": "**REST API** (Representational State Transfer) is an architectural style for web services.\n\n**Principles:**\n- Stateless\n- Client-server architecture\n- Uniform interface\n- Resource-based URLs\n\n**HTTP Methods:**\n- GET: Retrieve data\n- POST: Create new resource\n- PUT: Update entire resource\n- PATCH: Partial update\n- DELETE: Remove resource",
            "http status": "**Common HTTP Status Codes:**\n\n**2xx Success:**\n- 200 OK\n- 201 Created\n- 204 No Content\n\n**3xx Redirection:**\n- 301 Moved Permanently\n- 304 Not Modified\n\n**4xx Client Error:**\n- 400 Bad Request\n- 401 Unauthorized\n- 403 Forbidden\n- 404 Not Found\n\n**5xx Server Error:**\n- 500 Internal Server Error\n- 502 Bad Gateway\n- 503 Service Unavailable",
            "cors": "**CORS** (Cross-Origin Resource Sharing) allows servers to specify which origins can access resources.\n\n**Headers:**\n- `Access-Control-Allow-Origin`\n- `Access-Control-Allow-Methods`\n- `Access-Control-Allow-Headers`\n\n**Preflight request:** Browser sends OPTIONS request first for non-simple requests.\n\n**Fix in backend:** Add appropriate CORS headers or use middleware.",
            "authentication": "**Common authentication methods:**\n\n1. **Session-based**: Server stores session, client sends cookie\n2. **JWT (Token-based)**: Stateless, token contains user info\n3. **OAuth 2.0**: Third-party authorization\n4. **API Keys**: Simple, for server-to-server\n\n**JWT Flow:**\n1. User logs in with credentials\n2. Server returns JWT token\n3. Client sends token in Authorization header\n4. Server validates token",
            "default": "Web development essentials:\n\n- **Frontend**: HTML, CSS, JavaScript, React/Vue\n- **Backend**: Node.js, Python, APIs\n- **HTTP**: Request/response, status codes\n- **REST API**: Resource-based architecture\n- **Authentication**: JWT, OAuth, sessions\n- **Security**: CORS, HTTPS, XSS, CSRF\n\nWhat web topic would you like to explore?"
        }
    },
    
    # System Design
    "system_design": {
        "keywords": ["system design", "scalability", "microservice", "load balancer", "cache", "cdn"],
        "responses": {
            "load balancer": "A **load balancer** distributes traffic across multiple servers.\n\n**Algorithms:**\n- Round Robin\n- Least Connections\n- IP Hash\n- Weighted\n\n**Types:**\n- L4 (Transport): Based on IP/port\n- L7 (Application): Based on content\n\n**Benefits:** High availability, scalability, fault tolerance.",
            "caching": "**Caching** stores frequently accessed data for faster retrieval.\n\n**Levels:**\n- Browser cache\n- CDN\n- Application cache (Redis, Memcached)\n- Database cache\n\n**Strategies:**\n- Cache-aside\n- Write-through\n- Write-behind\n- Read-through\n\n**Invalidation:** TTL, event-based, manual.",
            "microservices": "**Microservices** architecture breaks applications into small, independent services.\n\n**Pros:**\n- Independent deployment\n- Technology flexibility\n- Scalability\n- Fault isolation\n\n**Cons:**\n- Complexity\n- Network latency\n- Data consistency\n\n**Communication:** REST, gRPC, Message queues",
            "database scaling": "**Database scaling strategies:**\n\n**Vertical (Scale up):**\n- More CPU, RAM, storage\n- Limited by hardware\n\n**Horizontal (Scale out):**\n- **Replication**: Master-slave for read scaling\n- **Sharding**: Partition data across servers\n- **Federation**: Split by function\n\n**Read scaling:** Replicas\n**Write scaling:** Sharding",
            "default": "System design fundamentals:\n\n- **Scalability**: Vertical vs Horizontal\n- **Load Balancing**: Traffic distribution\n- **Caching**: Redis, CDN, browser\n- **Database**: Replication, sharding\n- **Microservices**: Distributed architecture\n- **Message Queues**: Async processing\n\nWhat system design topic interests you?"
        }
    },
    
    # React
    "react": {
        "keywords": ["react", "hook", "usestate", "useeffect", "component", "jsx", "redux"],
        "responses": {
            "usestate": "**useState** is a React hook for managing state in functional components.\n\n```jsx\nimport { useState } from 'react';\n\nfunction Counter() {\n    const [count, setCount] = useState(0);\n    \n    return (\n        <div>\n            <p>Count: {count}</p>\n            <button onClick={() => setCount(count + 1)}>\n                Increment\n            </button>\n        </div>\n    );\n}\n```\n\n**Note:** State updates are asynchronous. Use functional updates for derived state.",
            "useeffect": "**useEffect** handles side effects in functional components.\n\n```jsx\nimport { useEffect, useState } from 'react';\n\nfunction User({ userId }) {\n    const [user, setUser] = useState(null);\n    \n    useEffect(() => {\n        // Runs on mount and when userId changes\n        fetch(`/api/users/${userId}`)\n            .then(res => res.json())\n            .then(setUser);\n        \n        // Cleanup function (optional)\n        return () => console.log('Cleanup');\n    }, [userId]); // Dependency array\n    \n    return <div>{user?.name}</div>;\n}\n```",
            "props vs state": "**Props:**\n- Passed from parent to child\n- Read-only (immutable)\n- Used for component configuration\n\n**State:**\n- Managed within component\n- Can be updated with setter\n- Triggers re-render on change\n\n```jsx\n// Props\n<Child name=\"John\" />\n\n// State\nconst [name, setName] = useState('John');\n```",
            "virtual dom": "**Virtual DOM** is React's lightweight copy of the actual DOM.\n\n**How it works:**\n1. State changes trigger re-render\n2. React creates new Virtual DOM\n3. Diffing: Compares new vs old Virtual DOM\n4. Reconciliation: Updates only changed parts\n\n**Benefits:**\n- Faster than direct DOM manipulation\n- Batched updates\n- Cross-platform (React Native)",
            "default": "React core concepts:\n\n- **Components**: Function or class-based\n- **JSX**: JavaScript + HTML syntax\n- **Props**: Parent to child data flow\n- **State**: Component internal data\n- **Hooks**: useState, useEffect, useContext\n- **Virtual DOM**: Efficient rendering\n\nWhat React topic would you like to learn?"
        }
    },
    
    # Git
    "git": {
        "keywords": ["git", "github", "branch", "merge", "commit", "version control"],
        "responses": {
            "basic commands": "**Essential Git commands:**\n\n```bash\n# Initialize repo\ngit init\n\n# Clone repo\ngit clone <url>\n\n# Stage changes\ngit add .  # All files\ngit add <file>  # Specific file\n\n# Commit\ngit commit -m \"message\"\n\n# Push\ngit push origin main\n\n# Pull\ngit pull origin main\n\n# Check status\ngit status\n\n# View history\ngit log --oneline\n```",
            "branching": "**Git branching workflow:**\n\n```bash\n# Create and switch to branch\ngit checkout -b feature/new-feature\n\n# Switch branches\ngit checkout main\n\n# List branches\ngit branch -a\n\n# Merge branch\ngit checkout main\ngit merge feature/new-feature\n\n# Delete branch\ngit branch -d feature/new-feature\n\n# Push branch to remote\ngit push -u origin feature/new-feature\n```",
            "merge vs rebase": "**Merge:**\n- Creates merge commit\n- Preserves history\n- Non-destructive\n\n**Rebase:**\n- Rewrites history\n- Linear history\n- Cleaner but risky for shared branches\n\n```bash\n# Merge\ngit checkout main\ngit merge feature\n\n# Rebase\ngit checkout feature\ngit rebase main\n```\n\n**Rule:** Never rebase public branches.",
            "undo": "**Undo changes in Git:**\n\n```bash\n# Discard unstaged changes\ngit checkout -- <file>\ngit restore <file>\n\n# Unstage files\ngit reset HEAD <file>\n\n# Undo last commit (keep changes)\ngit reset --soft HEAD~1\n\n# Undo last commit (discard changes)\ngit reset --hard HEAD~1\n\n# Revert a commit (creates new commit)\ngit revert <commit-hash>\n```",
            "default": "Git essentials:\n\n- **init/clone**: Start a repo\n- **add/commit**: Save changes\n- **push/pull**: Sync with remote\n- **branch/checkout**: Work on features\n- **merge/rebase**: Combine branches\n- **log/diff**: View history\n\nWhat Git topic would you like to explore?"
        }
    }
}

# Generic responses for unmatched queries
GENERIC_RESPONSES = [
    "That's a great question! While I don't have a specific answer prepared for that, I'd recommend checking documentation or tutorials for more detailed information.",
    "I'm here to help with technical questions. Could you be more specific about what aspect you'd like to know about?",
    "I can help with topics like Python, JavaScript, data structures, algorithms, web development, databases, system design, React, and Git. What would you like to learn about?",
]

# Greetings
GREETINGS = {
    "keywords": ["hello", "hi", "hey", "good morning", "good afternoon", "good evening", "help"],
    "responses": [
        "Hello! I'm here to help with technical questions. Ask me about:\n\n- **Programming**: Python, JavaScript, and more\n- **Data Structures**: Arrays, trees, graphs\n- **Algorithms**: Sorting, searching, Big O\n- **Web Development**: REST APIs, HTTP, authentication\n- **Databases**: SQL, joins, indexing\n- **System Design**: Scaling, caching, microservices\n- **React**: Hooks, state management\n- **Git**: Version control basics\n\nWhat would you like to learn about?",
        "Hi there! I can assist you with technical interview preparation and programming concepts. What topic interests you?",
        "Hello! Ready to help with your technical questions. Just ask away!"
    ]
}


class StaticChatbotService:
    """
    Chatbot service using static responses based on keyword matching.
    """
    
    def __init__(self):
        self.knowledge_base = KNOWLEDGE_BASE
        self.greetings = GREETINGS
        self.generic_responses = GENERIC_RESPONSES
    
    def _clean_message(self, message: str) -> str:
        """Clean and normalize the message."""
        return message.lower().strip()
    
    def _find_best_match(self, message: str) -> tuple:
        """Find the best matching topic and response."""
        message = self._clean_message(message)
        
        # Check for greetings first
        for keyword in self.greetings["keywords"]:
            if keyword in message:
                return "greeting", random.choice(self.greetings["responses"])
        
        # Find matching topic
        for topic_key, topic_data in self.knowledge_base.items():
            for keyword in topic_data["keywords"]:
                if keyword in message:
                    # Found a matching topic, now find best response
                    responses = topic_data["responses"]
                    
                    # Check for specific question matches
                    for question_key, answer in responses.items():
                        if question_key != "default":
                            # Check if question keywords are in message
                            question_words = question_key.split()
                            if all(word in message for word in question_words):
                                return topic_key, answer
                    
                    # Return default topic response
                    return topic_key, responses.get("default", random.choice(self.generic_responses))
        
        # No match found
        return None, random.choice(self.generic_responses)
    
    def chat(self, message: str, conversation_history: List[Dict] = None) -> str:
        """
        Process user message and return appropriate response.
        
        Args:
            message: The user's question
            conversation_history: Previous messages (not used in static version)
            
        Returns:
            Response string
        """
        if not message or not message.strip():
            return "Please ask a question, and I'll do my best to help!"
        
        topic, response = self._find_best_match(message)
        
        if topic:
            logger.info(f"Matched topic: {topic}")
        else:
            logger.info(f"No topic match for: {message[:50]}...")
        
        return response


# Singleton instance
chatbot_service = StaticChatbotService()
