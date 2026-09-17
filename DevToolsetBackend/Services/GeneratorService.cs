namespace DevToolsetBackend.Services;

public class GeneratorService
{
    public Guid GenerateUuid()
    {
        return Guid.NewGuid();
    }
}