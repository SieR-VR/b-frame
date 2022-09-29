import ts from "typescript";

export default function transformSource(sources: string[], compilerOptions: ts.CompilerOptions): string {
    const compilerHost = ts.createCompilerHost(compilerOptions);
    const program = ts.createProgram(sources, compilerOptions, compilerHost);
    const checker = program.getTypeChecker();

    const results = program.getSourceFiles().map((sourceFile) => {
        if (sourceFile.isDeclarationFile)
            return undefined;
            
        return ts.transform(sourceFile, [(context) => transform(context, checker)], compilerOptions);
    });

    const printer = ts.createPrinter();

    return results.map((result) => {
        if (!result)
            return undefined;

        return printer.printFile(result.transformed[0]);
    }).join("\n");
}
function transform(
    context: ts.TransformationContext,
    checker: ts.TypeChecker
): ts.Transformer<ts.SourceFile> {
    return (sourceFile: ts.SourceFile) => {
        try {
            if (sourceFile.isDeclarationFile)
                return sourceFile;

            return ts.visitEachChild(sourceFile, (node) => visitor(node, context, checker), context);
        } catch (e) {
            console.error(e);
            throw e;
        }
    }
}

function visitor(
    node: ts.Node,
    context: ts.TransformationContext,
    checker: ts.TypeChecker
): ts.Node {
    const extendsEntity = isExtendsEntity(node, checker);
    const extendsSystem = isExtendsSystem(node, checker);

    if (extendsEntity && extendsSystem)
        throw new Error("Cannot extend both Entity and System");

    if (extendsEntity)
        return transformEntity(node, context, checker);

    if (extendsSystem)
        return transformSystem(node, context, checker);

    return ts.visitEachChild(node, (n) => visitor(n, context, checker), context);
}

function isExtendsEntity(node: ts.Node, checker: ts.TypeChecker): node is ts.ClassDeclaration {
    if (!ts.isClassDeclaration(node))
        return false;

    const targetEntity = checker.getTypeAtLocation(node);
    const heritage = targetEntity.getBaseTypes() ?? [];

    return heritage.length === 1 && checker.typeToString(heritage[0]).includes("Entity");
}

function isExtendsSystem(node: ts.Node, checker: ts.TypeChecker): node is ts.ClassDeclaration {
    if (!ts.isClassDeclaration(node))
        return false;

    const targetSystem = checker.getTypeAtLocation(node);
    const heritage = targetSystem.getBaseTypes() ?? [];

    return heritage.length === 1 && checker.typeToString(heritage[0]).includes("System");
}

function transformEntity(
    node: ts.ClassDeclaration,
    context: ts.TransformationContext,
    checker: ts.TypeChecker
): ts.Node {
    const typeArgument =
        node.heritageClauses &&
        node.heritageClauses[0] &&
        node.heritageClauses[0].types &&
        node.heritageClauses[0].types[0] &&
        node.heritageClauses[0].types[0].typeArguments &&
        node.heritageClauses[0].types[0].typeArguments[0];

    if (!typeArgument)
        return node;

    if (!ts.isTupleTypeNode(typeArgument))
        throw new Error("Entity must be parameterized with a tuple type");

    const components = typeArgument.elements.map((type) => {
        if (!ts.isTypeReferenceNode(type))
            throw new Error("Entity must be parameterized with a tuple of type references");

        if (!ts.isIdentifier(type.typeName))
            throw new Error("Entity must be parameterized with a tuple of identifiers");

        return type.typeName.text;
    });

    const componentProperties = components.map((component) => {
        const hashed = component.split("").reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0);

        const hashString = hashed.toString(16).padStart(8, "0");

        return ts.factory.createStringLiteral(hashString);
    });

    const componentProperty = ts.factory.createPropertyDeclaration(
        undefined,
        [ts.factory.createModifier(ts.SyntaxKind.StaticKeyword)],
        ts.factory.createIdentifier("__components"),
        undefined,
        undefined,
        ts.factory.createArrayLiteralExpression(componentProperties)
    );

    return ts.factory.updateClassDeclaration(
        node,
        node.decorators,
        node.modifiers,
        node.name,
        node.typeParameters,
        node.heritageClauses,
        [
            ...node.members,
            componentProperty
        ]
    );
}

/**
 * System transformation
 * @param node Node of the class which extends System base class
 * @param context Transformation context
 * @param checker Type checker
 * @returns Transformed node class
 */
function transformSystem(
    node: ts.ClassDeclaration,
    context: ts.TransformationContext,
    checker: ts.TypeChecker
): ts.Node {
    const targetSystem = checker.getTypeAtLocation(node);
    const heritage = targetSystem.getBaseTypes() ?? [];

    if (heritage.length !== 1 || !checker.typeToString(heritage[0]).includes("System"))
        throw new Error("System must extend a system base class");

    const heritageTParams = (heritage[0] as ts.TypeReference).typeArguments ?? [];

    const systemHash = SimpleHash(checker.typeToString(heritageTParams[0]));

    const componentProperty = ts.factory.createPropertyDeclaration(
        undefined,
        [ts.factory.createModifier(ts.SyntaxKind.StaticKeyword)],
        ts.factory.createIdentifier("__component"),
        undefined,
        undefined,
        ts.factory.createStringLiteral(systemHash)
    );

    return ts.factory.updateClassDeclaration(
        node,
        node.decorators,
        node.modifiers,
        node.name,
        node.typeParameters,
        node.heritageClauses,
        [
            ...node.members,
            componentProperty
        ]
    );
}

const SimpleHash = (str: string) => {
    const hashed = str.split("").reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
    }, 0) & 0x7FFFFFFF;

    return hashed.toString(16).padStart(8, "0");
}