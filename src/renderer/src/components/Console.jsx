import React from "react";

export default function Console(params) {
    return (
        <div
            id="console"
            ref={params.consoleRef}
            className={`bg-white/10 text-white h-full w-full absolute z-40 max-h-[300px] overflow-y-scroll ${params.showConsole ? "flex flex-col" : "hidden"}`}
        >
            <div className="grow"></div>
            <div>
                <table className="w-auto">
                    <tbody>
                        {params.hyperedges.map((edge, i) => {
                            return (
                                <tr key={`${edge.join("->")}-${i}}`}>
                                    {edge.map((node, j) => {
                                        return (
                                            <React.Fragment
                                                key={`${node}-${j}-group`}
                                            >
                                                <td
                                                    key={`${node}-${j}`}
                                                    className="p-1"
                                                >
                                                    <a
                                                        onClick={(e) =>
                                                            params.removeHyperedge(
                                                                edge
                                                            )
                                                        }
                                                        className="cursor-pointer"
                                                    >
                                                        {node}
                                                    </a>
                                                </td>
                                                {j < edge.length - 1 && (
                                                    <td
                                                        key={`${node}-${i}-sep`}
                                                    >
                                                        →
                                                    </td>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
