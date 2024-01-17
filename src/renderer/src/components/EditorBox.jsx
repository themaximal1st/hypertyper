import { useState, useEffect } from "react";

export default function EditorBox({ add }) {
    const [hyperedge, setHyperedge] = useState([]);
    const [input, setInput] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();

        if (input === "") {
            setHyperedge([]);
            setInput("");
            return;
        }

        const current = [...hyperedge, input];
        setHyperedge(current);
        setInput("");
        await add(current);
    }

    return (
        <div className="absolute inset-0 pointer-events-none z-20">
            <div className="flex justify-center items-start gap-4 mt-4">
                {hyperedge.map((item) => (
                    <div
                        key={item}
                        className="bg-white border-r p-2 rounded-lg pointer-events-auto opacity-100"
                    >
                        {item}
                    </div>
                ))}
                <div className="rounded-lg opacity-100">
                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => {
                                setInput(e.target.value);
                            }}
                            placeholder="Create"
                            className="p-2 border-0 rounded-lg pointer-events-auto outline-none"
                        />
                    </form>
                </div>
            </div>
        </div>
    );
}
