using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;

namespace generator
{
    class Program
    {
        static void Main(string[] args)
        {
            try
            {
                int setsToGenerate = 1000;
                int teamsToGenerate = 10;

                String teamTemplate = File.ReadAllText(@"C:\Users\Craig\Documents\src\ctml\extension\test\fake standings template.js");
                StringBuilder output = new StringBuilder();
                Random generator = new Random(DateTime.Now.Millisecond);

                output.Append("var testStandingsSets = new Array(");
                for (int setBeingGenerated = 1; setBeingGenerated <= setsToGenerate; setBeingGenerated++)
                {
                    output.Append("{");

                    output.Append("ID: \"" + Guid.NewGuid().ToString() + "\"," + Environment.NewLine) ;

                    output.Append("data: new Array(");
                    for (int teamBeingGenerated = 1; teamBeingGenerated <= teamsToGenerate; teamBeingGenerated++)
                    {
                        output.Append(string.Format(
                            teamTemplate,
                            "Team " + teamBeingGenerated.ToString(),
                            (generator.Next(0, 20)).ToString(),
                            (generator.Next(0, 20)).ToString(),
                            (generator.Next(0, 20)).ToString(),
                            (generator.Next(0, 20)).ToString(),
                            (generator.NextDouble()).ToString(),
                            (generator.Next(0, 20)).ToString(),
                            (generator.Next(0, 20)).ToString(),
                            (generator.Next(0, 20)).ToString(),
                            (generator.Next(0, 2) + generator.NextDouble()).ToString(),
                            (generator.Next(0, 2) + generator.NextDouble()).ToString()));

                        output.Append(teamBeingGenerated < teamsToGenerate ? "," + Environment.NewLine : string.Empty);
                    }

                    output.Append(")}");
                    output.Append(setBeingGenerated < setsToGenerate ? "," + Environment.NewLine : string.Empty);
                }
                output.Append(");");

                File.WriteAllText(@"C:\Users\Craig\Documents\src\ctml\extension\test\fake standings.js", output.ToString());
            }
            catch (Exception ex)
            {
                Console.WriteLine(string.Format("{0}: {1}\n{2}",
                    ex.GetType().ToString(),
                    ex.Message,
                    ex.StackTrace));
            }
        }
    }
}
